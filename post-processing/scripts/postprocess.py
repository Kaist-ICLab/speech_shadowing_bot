import json
import os
import re
import numpy as np
import pandas as pd
import pymongo as pymongo
import scipy.stats as stats
from scipy.stats import ttest_ind
from diff_match_patch import diff_match_patch
import matplotlib.pyplot as plt
from utils.survey_questions import categories, reverse_score_questions, pre_columns, post_columns, themes, \
    personalized_comments, non_personalized_comments
from utils.mappings import p_or_np
from factor_analyzer import FactorAnalyzer
from collections import Counter
from openai import OpenAI

mongo_client = None
client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key="YOUR_OPENAI_API_KEY",
)


def load_csv_data(file_path):
    """Load data from a CSV file and return a pandas DataFrame.

    Args:
        file_path (str): path to the CSV file

    Returns:
        data (pandas DataFrame): DataFrame containing the loaded data

    """
    try:
        data = pd.read_csv(file_path)
        df_questions_only = data.drop(
            columns=['Timestamp', 'Name', 'Leave any comments/feedback/thoughts on the study'])
        return df_questions_only
    except Exception as e:
        print(f"Error loading data from CSV: {e}")
        return None


def connect_to_mongodb():
    """Connect to MongoDB and return the client object."""
    global mongo_client
    try:
        # Connect to MongoDB
        if mongo_client is None:
            mongo_client = pymongo.MongoClient(os.environ['API_STRING'], tls=True, tlsAllowInvalidCertificates=True)
        return mongo_client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None


def parse_original_text(text):
    """Parse the originalText to extract demographic info and answers."""
    pattern = (r"I'm (.*?),(\d+) years old and (.*?).Major:(.*?).Native Language:(.*?).Years Studying English:(.*?)."
               r"Socioeconomic Status:(.*?).English Proficiency:(.*?).Preferred Lesson Time:(.*?)(\[.*\])")
    match = re.match(pattern, text)
    if match:
        user_info = {
            "userName": match.group(1),
            "age": int(match.group(2)),
            "gender": match.group(3),
            "major": match.group(4),
            "nativeLanguage": match.group(5),
            "yearsStudyingEnglish": match.group(6),
            "socioeconomicStatus": match.group(7),
            "englishProficiency": match.group(8),
            "preferredLessonTime": match.group(9)
        }
        answers_string = match.group(10)
        answers_array = json.loads(answers_string)
        return user_info, answers_array
    return None, None


def grab_original_text_from_string(data):
    """Extracts information related to "Socioeconomic Status" from a pandas DataFrame.

    This function filters rows containing "Socioeconomic Status" from the input DataFrame and
    extracts structured information into a new DataFrame. The extracted data includes user
    information, survey question text, and corresponding answers.

    Args:
        data (pandas DataFrame): Input DataFrame containing survey responses.

    Returns:
        None: If the input DataFrame is empty or None.
        str: Confirmation message indicating the successful export of the structured data to
            a CSV file named 'socioeconomic_status_grouped_data.csv'.
    """
    if data is not None:
        # Filter rows containing "Socioeconomic Status"
        socioeconomic_status_data = data  # Select the entire DataFrame
        if socioeconomic_status_data.empty:
            print("No data")
        else:
            organized_data = []
            for _, row in socioeconomic_status_data.iterrows():
                user_info, answers_array = parse_original_text(row['originalText'])
                if user_info and answers_array:
                    for answer in answers_array:
                        organized_data.append({**user_info, "question": answer['q'], "answer": int(answer['a'])})

            organized_df = pd.DataFrame(organized_data)
            organized_df.to_csv('socioeconomic_status_grouped_data.csv', index=False)
            print(f"Data exported to {'socioeconomic_status_grouped_data.csv'}")


def plot_pre_survey():
    data = pd.read_csv(
        'socioeconomic_status_grouped_data.csv')
    # Group the data by question and calculate mean and standard deviation
    question_stats = data.groupby('question')['answer'].agg(['mean', 'std'])
    print(question_stats)

    # Plot the average scores with error bars representing standard deviation
    plt.figure(figsize=(10, 6))
    question_stats['mean'].plot(kind='bar', yerr=question_stats['std'], capsize=5)
    plt.title('Average Scores by Question')
    plt.xlabel('Question')
    plt.ylabel('Average Score')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.show()

    # Calculate frequency of answers by question
    answer_frequencies = data.groupby(['question', 'answer']).size().unstack().fillna(0)
    print(answer_frequencies)

    # Plot the frequency of answers by question
    answer_frequencies.plot(kind='bar', stacked=True, figsize=(10, 6), colormap='viridis')
    plt.title('Frequency of Answers by Question')
    plt.xlabel('Question')
    plt.ylabel('Frequency')
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Answer', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plt.show()


def plot_data_points_user(filtered_data):
    # Plot data points by user
    for user, group in filtered_data.groupby('user'):
        plt.plot(group['date'], group['count'], label=user)

    # Add labels and title
    plt.xlabel('Date')
    plt.ylabel('Count')
    plt.title('Data Points by User')
    plt.legend()

    # Show plot
    plt.show()


def calculate_descriptive_stats(filtered_data, p_or_np):
    """Calculate descriptive statistics for each group and map user to P or NP.

    Args:
        filtered_data (pandas DataFrame): DataFrame containing the filtered data
        p_or_np (dict): Dictionary with usernames mapped to P or NP groups

    Returns:
        descriptive_stats (pandas DataFrame): DataFrame containing the descriptive statistics
    """
    # Create a reverse mapping to find if a user is in P or NP
    reverse_mapping = {}
    for group, users in p_or_np.items():
        for user in users:
            reverse_mapping[user] = group

    # Map the group to each user
    filtered_data['group'] = filtered_data['user'].apply(lambda x: reverse_mapping.get(x, 'Unknown'))

    # Calculate descriptive statistics
    descriptive_stats = filtered_data.groupby(['user', 'group']).agg(
        daily_usage_mean=('count', 'mean'),
        daily_usage_std=('count', 'std'),
        total_usage_sum=('count', 'sum')
    ).reset_index()

    return descriptive_stats


def analyze_groups_and_ttest(descriptive_stats):
    """
    Analyze the groups and perform a t-test on daily usage means.

    Args:
        descriptive_stats (pandas DataFrame): DataFrame containing the descriptive statistics

    Returns:
        ttest_result (dict): Dictionary containing the t-test result of daily_usage_mean.
        ttest_result (dict): Dictionary containing the t-test result total_usage_sum.
    """
    # Extract the daily usage means for each group
    personalized_group = descriptive_stats[descriptive_stats['group'] == 'P']['daily_usage_mean']
    non_personalized_group = descriptive_stats[descriptive_stats['group'] == 'NP']['daily_usage_mean']

    p_group = descriptive_stats[descriptive_stats['group'] == 'P']['total_usage_sum']
    np_group = descriptive_stats[descriptive_stats['group'] == 'NP']['total_usage_sum']

    # Perform an independent samples t-test
    ttest_result = stats.ttest_ind(personalized_group, non_personalized_group, equal_var=False)
    ttest_result_total = stats.ttest_ind(p_group, np_group, equal_var=False)

    return ttest_result, ttest_result_total


def average_score_length_by_level(data):
    # Calculate average level
    average_level = calculate_average_level(data)
    print(average_level)

    # Calculate average score
    average_score = calculate_average_score(data)
    print(average_score)

    # Caclulate average score by level
    average_scores_by_level = calculate_average_score_per_level(data)
    print(average_scores_by_level)

    # Calculate the length of sentences by level
    data['sentence_length'] = data['transcribedText'].apply(lambda x: len(x.split()))
    average_length_by_level = data.groupby('level')['sentence_length'].agg(['mean', 'std'])
    # Calculate the total number of lessons at each level
    total_lessons_by_level = data['level'].value_counts().sort_index()

    # Concatenate total lessons with average_length_by_level DataFrame
    average_length_by_level['total_lessons'] = total_lessons_by_level

    print(data['sentence_length'].mean())
    print(average_length_by_level)


def filter_punctuations(s):
    """
    Remove all punctuations from a string and replace multiple spaces with a single space.

    Args:
        s (str): Input string.

    Returns:
        str: String with punctuations removed and multiple spaces replaced with a single space.
    """
    s = re.sub(r'[.,/#!$%^&*;:{}=\-_`~()]', '', s)
    s = re.sub(r'\s{2,}', ' ', s)
    return s.lower()


def analyze_personalized_group(collection):
    """Analyze data for the personalized group and perform detailed analysis on theme and originalText.

    Args:
        collection (pymongo.collection.Collection): MongoDB collection object
    """
    try:
        # Query data for personalized group
        personalized_data = list(collection.find({"user": {"$in": p_or_np["P"]}}))
        df_personalized = pd.DataFrame(personalized_data)

        # Convert 'timestamp' to datetime
        df_personalized['timestamp'] = pd.to_datetime(df_personalized['timestamp'], unit='ms')

        # Calculate similarity score using diff-match-patch library if not present
        if 'score' not in df_personalized.columns:
            dmp = diff_match_patch()

            def calculate_score(row):
                diffs = dmp.diff_main(filter_punctuations(row['originalText']),
                                      filter_punctuations(row['transcribedText']))
                dmp.diff_cleanupSemantic(diffs)
                return 1 - (dmp.diff_levenshtein(diffs) / max(len(row['originalText']), len(row['transcribedText'])))

            df_personalized['score'] = df_personalized.apply(calculate_score, axis=1)

        # Sort data by timestamp
        df_personalized.sort_values(by='timestamp', inplace=True)
        users = df_personalized['user'].unique()

        for user in users:
            user_data = df_personalized[df_personalized['user'] == user]

            # Plot per day
            user_data['date'] = user_data['timestamp'].dt.date
            unique_dates = user_data['date'].unique()

            for date in unique_dates:
                daily_data = user_data[user_data['date'] == date]
                plt.figure(figsize=(12, 6))
                plt.plot(daily_data['timestamp'], daily_data['score'], marker='o', linestyle='-', label='Score')
                theme_changes = daily_data[daily_data['theme'].shift() != daily_data['theme']]
                for idx, row in theme_changes.iterrows():
                    plt.annotate(row['theme'], (row['timestamp'], row['score']), textcoords="offset points",
                                 xytext=(0, 10), ha='center')

                plt.xlabel('Timestamp (ms)')
                plt.ylabel('Score')
                plt.title(f'Score Over Time for User: {user} on Date: {date}')
                plt.legend()
                plt.grid(True)
                plt.show()

            # Analysis: How each user used personalization
            print(f"\nAnalysis for User: {user}")
            print("Themes Used:")
            print(user_data['theme'].value_counts())
            print("Original Texts:")
            print(user_data['originalText'].tolist())

            # Filter out None values in the theme column
            user_data_filtered = user_data[user_data['theme'].notnull()]

            # Calculate topic switches per day
            daily_topic_switches = user_data_filtered.groupby('date')['theme'].apply(
                lambda x: (x != x.shift()).sum() - 1)
            print("\nNumber of Topic Switches per Day:")
            print(daily_topic_switches)

            # Calculate number of lessons in a given topic before switching to a new topic
            user_data_filtered['theme_change'] = (
                    user_data_filtered['theme'] != user_data_filtered['theme'].shift()).cumsum()
            lessons_per_topic = user_data_filtered.groupby(['date', 'theme_change']).size()
            print("\nNumber of Lessons in a Given Topic Before Switching to a New Topic:")
            print(lessons_per_topic)

            # Print out topics per day
            topics_per_day = user_data_filtered.groupby('date')['theme'].apply(list)
            print("\nTopics per Day:")
            for date, topics in topics_per_day.items():
                print(f"Date: {date}, Topics: {topics}")

            # Calculate average number of theme switches per day with std
            avg_theme_switches_per_day = daily_topic_switches.mean()
            std_theme_switches_per_day = daily_topic_switches.std()
            print(
                f"\nAverage Number of Theme Switches per Day: {avg_theme_switches_per_day} ± {std_theme_switches_per_day}")

            # Calculate average number of lessons before theme switch with std
            avg_lessons_before_switch = lessons_per_topic.mean()
            std_lessons_before_switch = lessons_per_topic.std()
            print(
                f"\nAverage Number of Lessons Before Theme Switch: {avg_lessons_before_switch} ± {std_lessons_before_switch}")

            # Calculate average number of lessons in a given theme with weighted std
            lessons_per_theme = user_data_filtered.groupby('theme').size()
            avg_lessons_per_theme = lessons_per_theme.mean()
            std_lessons_per_theme = np.sqrt(
                np.average((lessons_per_theme - avg_lessons_per_theme) ** 2, weights=lessons_per_theme))
            print(f"\nAverage Number of Lessons in a Given Theme: {avg_lessons_per_theme} ± {std_lessons_per_theme}")

        # Validation of personalized content generated
        unique_themes = df_personalized['theme'].unique()
        print("\nUnique Themes Generated:")
        print(unique_themes)

        # Length and complexity of original texts
        df_personalized['text_length'] = df_personalized['originalText'].apply(lambda x: len(x.split()))
        print("\nAverage Text Length by User:")
        print(df_personalized.groupby('user')['text_length'].mean())

        # Plot average text length by user
        plt.figure(figsize=(10, 6))
        df_personalized.groupby('user')['text_length'].mean().plot(kind='bar')
        plt.xlabel('User')
        plt.ylabel('Average Text Length')
        plt.title('Average Text Length by User')
        plt.show()

        # Overall counts per topic of all participants
        print("\nOverall Counts per Topic of All Participants:")
        print(df_personalized['theme'].value_counts())

    except Exception as e:
        print(f"An error occurred during analysis: {e}")


def get_summary(text):
    """Get one-word summary using OpenAI GPT-4o."""
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f"This sentence was generated using one word as the topic. Topics that are "
                                    f"similar should be grouped into the main topic. Guess that one word"
                                    f"and return only that word:\n\n{text}"}
    ]
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )
    return response.choices[0].message.content.strip()


def calculate_match_percentage(df, user_theme_column, original_text_column):
    """Calculate the percentage of sentences matching the given theme."""
    match_count = 0
    valid_entries = df.dropna(subset=[user_theme_column, original_text_column])

    for idx, row in valid_entries.iterrows():
        original_text = row[original_text_column]
        user_theme = row[user_theme_column]

        if pd.notnull(original_text) and pd.notnull(user_theme):
            deduced_theme = get_summary(original_text).lower()
            if user_theme.lower() == deduced_theme:
                match_count += 1

            # Debug prints
            # print(f"This was the user inputted theme: {user_theme} and the deduced theme: {deduced_theme}")

    # Calculate match percentage
    total_count = len(valid_entries)
    match_percentage = (match_count / total_count) * 100

    return match_percentage


def original_text_to_csv(valid_entries, output_csv='original_texts.csv'):
    """Export the original texts to a CSV file."""
    try:
        # Select the 'originalText' column and export to CSV
        original_texts = valid_entries[['originalText']]
        original_texts.to_csv(output_csv, index=False)
        baba = valid_entries[['theme']]
        baba.to_csv('themes.csv', index=False)
        print(f"Original texts have been exported to {output_csv}")
    except Exception as e:
        print(f"An error occurred while exporting to CSV: {e}")


def load_mongodb_data():
    """Load data from MongoDB and return a pandas DataFrame.

    Returns:
        data (pandas DataFrame): DataFrame containing the loaded data

    """
    try:
        # Connect to MongoDB
        connect_to_mongodb()
        if mongo_client is None:
            return None

        db = mongo_client['sessions']
        col = db['userStudyDb']

        # Read data from CSV file
        data = pd.read_csv(
            'pre-survey filtered - Sheet1.csv')
        users_from_csv = data['user'].unique()

        grab_original_text_from_string(data)
        plot_pre_survey()

        # # Query data from collection
        data = pd.DataFrame(list(col.find()))
        data['date'] = pd.to_datetime(data['timestamp'], unit='ms').dt.tz_localize('UTC').dt.tz_convert('Asia/Seoul')
        data_filtered_p = data[data['user'].isin(p_or_np["P"])]
        data_filtered_np = data[data['user'].isin(p_or_np["NP"])]
        combined_users = set(p_or_np["P"]).union(set(p_or_np["NP"]))
        data_points_by_user = data.groupby(['user', pd.Grouper(key='date', freq='D')]).size().reset_index(name='count')

        # Convert 'date' column to datetime type
        data_points_by_user['date'] = pd.to_datetime(data_points_by_user['date'])

        # Filter data_points_by_user based on users from CSV file
        data_points_by_user_filtered = data_points_by_user[data_points_by_user['user'].isin(users_from_csv)]
        print(data_points_by_user_filtered)

        # Export filtered data to CSV file
        data_points_by_user_filtered.to_csv('data_points_by_user_filtered.csv', index=False)
        print("Filtered data exported to 'data_points_by_user_filtered.csv'")

        plot_data_points_user(data_points_by_user_filtered)

        average_score_length_by_level(data[data['user'].isin(combined_users)])
        average_score_length_by_level(data_filtered_p)
        average_score_length_by_level(data_filtered_np)

        # Calculate descriptive statistics
        descriptive_stats = calculate_descriptive_stats(data_points_by_user_filtered, p_or_np)
        descriptive_stats.to_csv('descriptive_stats', index=False)
        print(descriptive_stats)

        ttest_result_daily, ttest_result_total = analyze_groups_and_ttest(descriptive_stats)
        print("\nT-Test Result Daily:")
        print(ttest_result_daily)

        print("\nT-Test Result Total:")
        print(ttest_result_total)

        # Additional analysis on personalized group
        analyze_personalized_group(col)

        # Define the column names for user theme and original text
        user_theme_column = 'theme'
        original_text_column = 'originalText'

        # Calculate match percentage
        match_percentage = calculate_match_percentage(data_filtered_p, user_theme_column, original_text_column)
        print(f"Percentage of sentences matching the given theme: {match_percentage}%")
        valid_dataset = data_filtered_p.dropna(subset=[user_theme_column, original_text_column])
        valid_dataset.to_csv('valid_dataset.csv', index=False)
        original_text_to_csv(valid_dataset)

    except Exception as e:
        print(f"Error loading data from MongoDB: {e}")
        return None


def calculate_average_level(data):
    """Calculate the average level of users.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        average_level (float): average level of users

    """
    average_level = data['level'].mean()
    std_dev_level = data['level'].std()
    print(f"Average level: {average_level} ± {std_dev_level}")
    return average_level


def calculate_average_score(data):
    """Calculate the average score.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        average_score (float): average score

    """
    scores = []
    dmp = diff_match_patch()
    for _, row in data.iterrows():
        original_text = filter_punctuations(row['originalText'])
        transcribed_text = filter_punctuations(row['transcribedText'])

        diff = dmp.diff_main(original_text, transcribed_text)
        dmp.diff_cleanupSemantic(diff)

        similarities = sum(len(text) for change_type, text in diff if change_type == 0)
        differences = sum(len(text) for change_type, text in diff if change_type != 0)

        score = similarities / (similarities + differences)
        scores.append(score)

    # Add scores to DataFrame
    data['score'] = scores

    # Calculate average score and standard deviation
    average_score = data['score'].mean()
    std_dev_score = data['score'].std()

    print(f"Average score: {average_score} ± {std_dev_score}")
    return average_score


def calculate_average_score_per_level(data):
    """Calculate the average score per level.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        average_scores_by_level (pandas DataFrame): DataFrame containing average scores and standard deviation per level
    """
    scores = []
    dmp = diff_match_patch()

    for _, row in data.iterrows():
        original_text = filter_punctuations(row['originalText'])
        transcribed_text = filter_punctuations(row['transcribedText'])

        diff = dmp.diff_main(original_text, transcribed_text)
        dmp.diff_cleanupSemantic(diff)

        similarities = sum(len(text) for change_type, text in diff if change_type == 0)
        differences = sum(len(text) for change_type, text in diff if change_type != 0)

        score = similarities / (similarities + differences)
        scores.append(score)

    # Add scores to DataFrame
    data['score'] = scores

    # Calculate average score and standard deviation per level
    average_scores_by_level = data.groupby('level')['score'].agg(['mean', 'std']).reset_index()
    average_scores_by_level.columns = ['level', 'average_score', 'std_dev_score']

    return average_scores_by_level


def calculate_frequencies(data, pre_post=None):
    """Calculate frequencies of user answers based on specified columns.

    Args:
        data (pandas DataFrame): DataFrame containing the data
        pre_post (str): indicates whether the data is from pre-survey or post-survey

    Returns:
        frequencies (pandas DataFrame): DataFrame containing the calculated frequencies

    """
    if pre_post == "pre":
        columns = pre_columns
    elif pre_post == "post":
        columns = post_columns
    else:
        raise ValueError("Invalid value for pre_post parameter.")

    # Calculate averages and standard deviations
    averages = data[columns].mean().reset_index()
    std_devs = data[columns].std().reset_index()
    averages.columns = ['Question', 'Average']
    std_devs.columns = ['Question', 'Standard Deviation']

    # Merge averages and standard deviations into one DataFrame
    stats = pd.merge(averages, std_devs, on='Question')

    frequencies = pd.DataFrame(columns=["Question", "Answer", "Frequency", "Percentage"])

    for column in columns:
        column_data = data[column].value_counts(normalize=True).reset_index()
        column_data.columns = ["Answer", "Percentage"]
        column_data['Frequency'] = data[column].value_counts().values
        column_data['Question'] = column
        column_data['Percentage'] = column_data['Percentage'] * 100  # Convert to percentage
        frequencies = pd.concat([frequencies, column_data], ignore_index=True)

    return stats, frequencies


def calculate_constructs(data):
    # Calculate the count and percentage of each Likert scale value per construct
    category_counts = {}
    category_percentages = {}
    for category, questions in categories.items():
        category_counts[category] = {}
        category_percentages[category] = {}
        for scale in range(5, 0, -1):
            count = (data[questions] == scale).sum().sum()
            percentage = count / (len(questions) * len(data)) * 100
            category_counts[category][scale] = count
            category_percentages[category][scale] = percentage

    # Convert the counts and percentages to DataFrames
    counts_df = pd.DataFrame(category_counts).T
    percentages_df = pd.DataFrame(category_percentages).T

    # Calculate mean and standard deviation for each category
    category_stats = {}
    for category, questions in categories.items():
        category_stats[category] = {
            "mean": data[questions].mean(axis=1).mean(),
            "std": data[questions].mean(axis=1).std()
        }

    stats_df = pd.DataFrame(category_stats).T

    print("Count of each Likert scale answer per category:")
    print(counts_df)

    print("\nPercentage of each Likert scale answer per category:")
    print(percentages_df)

    print("\nMean and standard deviation per category:")
    print(stats_df)

    return counts_df, percentages_df, stats_df


def ttest_constructs(group_1, group_2):
    ttest_results = {}
    for category in categories.keys():
        group_1_scores = group_1[[category + "_Sum"]].values.flatten()
        group_2_scores = group_2[[category + "_Sum"]].values.flatten()
        ttest_results[category] = ttest_ind(group_1_scores, group_2_scores)
    return ttest_results


def calculate_cronbach_alpha(data):
    """Calculate the Cronbach's alpha coefficient for a set of items.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        cronbach_alpha (float): Cronbach's alpha coefficient

    """
    item_responses = []
    for column in post_columns:
        item_responses.append(data[column])
    item_responses = pd.DataFrame(item_responses).transpose()

    # Number of items
    k = item_responses.shape[1]

    # Calculate the item variances
    item_variances = item_responses.var(axis=0, ddof=1)

    # Calculate the total variance
    total_variance = item_responses.sum(axis=1).var(ddof=1)

    if total_variance == 0:
        print("Total variance is zero. Cronbach's alpha may not be meaningful.")
        return 0

    # Calculate Cronbach's alpha
    cronbach_alpha = (k / (k - 1)) * (1 - (item_variances.sum() / total_variance))
    return cronbach_alpha


def calculate_levene_test(data):
    """Calculate the Levene Test for the post_columns.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        levene_test (float): Levene Test statistic
        p_value (float): p-value associated with the Levene Test

    """
    post_data = data[post_columns]
    levene, p_val = stats.levene(*post_data.values.T)
    return levene, p_val


def calculate_shapiro_wilk_test(data):
    """Calculate the Shapiro-Wilk test for the post_columns.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        test_statistic (float): Shapiro-Wilk test statistic
        p_value (float): p-value associated with the Shapiro-Wilk test

    """
    post_data = data[post_columns]
    test_statistic, p_val = stats.shapiro(post_data.values.flatten())
    return test_statistic, p_val


def perform_t_test(data_group1, data_group2):
    """Perform t-test between two groups.

    Args:
        data_group1 (pandas DataFrame): DataFrame containing data for group 1
        data_group2 (pandas DataFrame): DataFrame containing data for group 2

    Returns:
        t_statistic (float): t-test statistic
        p_value (float): p-value associated with the t-test

    """
    t_stat, p_val = stats.ttest_ind(data_group1, data_group2)
    return t_stat, p_val


def calculate_cohens_d(data_group1, data_group2):
    """Calculate Cohen's d effect size between two groups.

    Args:
        data_group1 (pandas DataFrame): DataFrame containing data for group 1
        data_group2 (pandas DataFrame): DataFrame containing data for group 2

    Returns:
        cohens_d (float): Cohen's d effect size

    """
    mean_diff = data_group1.mean() - data_group2.mean()
    pooled_std = np.sqrt((data_group1.std() ** 2 + data_group2.std() ** 2) / 2)
    if pooled_std == 0:
        return 0
    cohens_d = mean_diff / pooled_std
    return cohens_d


def calculate_pearson_correlation(data):
    """Calculate the Pearson correlation for the post columns.

    Args:
        data (pandas DataFrame): DataFrame containing the data

    Returns:
        correlation_matrix (pandas DataFrame): DataFrame containing the Pearson correlation coefficients

    """
    post_data = data[post_columns]
    correlation_matrix = post_data.corr(method='pearson')
    return correlation_matrix


def reverse_score(data, columns, max_score=5):
    """Reverse the scores for the specified columns.

    Args:
        data (pd.DataFrame): The DataFrame containing the data.
        columns (list): The list of columns to reverse scores.
        max_score (int): The maximum score in the scale (default is 5).

    Returns:
        pd.DataFrame: The DataFrame with reversed scores for the specified columns.
    """
    reversed_data = data.copy()
    for column in columns:
        reversed_data[column] = (max_score + 1) - reversed_data[column]
    return reversed_data


def calculate_cronbach_alpha_2(df):
    """Calculate the Cronbach's alpha for a DataFrame containing survey responses."""
    item_scores = df.T
    item_variances = item_scores.var(axis=1, ddof=1)
    total_variance = item_scores.sum(axis=0).var(ddof=1)

    n_items = len(df.columns)
    cronbach_alpha = (n_items / (n_items - 1)) * (1 - (item_variances.sum() / total_variance))

    return cronbach_alpha


# Define function to conduct factor analysis
def conduct_factor_analysis(data):
    # Conduct factor analysis using FactorAnalyzer library
    # You can specify parameters like number of factors, rotation method, etc.
    # Return eigenvalues
    factor_analyzer = FactorAnalyzer()
    factor_analyzer.fit(data)
    return factor_analyzer.get_eigenvalues()[0]


def filter_users(dataframe, users):
    """Filter the DataFrame to only include specified users."""
    return dataframe[dataframe['Name'].isin(users)]


if __name__ == "__main__":
    load_mongodb_data()

    # Load data from CSV
    csv_data_post_non_personalized = load_csv_data("[NP] Editable Post-survey - Sheet1.csv")
    csv_data_post_personalized = load_csv_data("[P] Editable Post-survey - Sheet1.csv")
    csv_data_post_consolidated = load_csv_data("post_survey_consolidated - Sheet1.csv")

    # RQ1 Calculate frequencies
    mean, frequencies = calculate_frequencies(csv_data_post_consolidated, pre_post="post")
    frequencies.to_csv('frequencies.csv', index=True)
    mean.to_csv('mean.csv', index=True)
    print(frequencies)
    print(mean)

    # RQ2 Calculate constructs
    counts_np, percentages_np, stats_np = calculate_constructs(csv_data_post_non_personalized)
    counts_p, percentages_p, stats_p = calculate_constructs(csv_data_post_personalized)

    # Calculate constructs for: rarely change topics (T1), sometimes change topics (T2), and frequently change topics
    # (T3)
    dont_drop_name = pd.read_csv("[P] Editable Post-survey - Sheet1.csv")
    dont_drop_name = dont_drop_name.drop(
        columns=['Timestamp', 'Leave any comments/feedback/thoughts on the study'])
    T3 = ['P1', 'P4']
    T2 = ['P3', 'P5', 'P6']
    T1 = ['P2']
    csv_data_post_personalized_T3 = filter_users(dont_drop_name, T3)
    csv_data_post_personalized_T2 = filter_users(dont_drop_name, T2)
    csv_data_post_personalized_T1 = filter_users(dont_drop_name, T1)

    calculate_constructs(csv_data_post_personalized_T3)
    calculate_constructs(csv_data_post_personalized_T2)
    calculate_constructs(csv_data_post_personalized_T1)

    # Define the dataframes
    df1 = pd.DataFrame({
        '5': [15, 6, 0, 2, 6],
        '4': [26, 23, 11, 18, 16],
        '3': [9, 10, 4, 4, 5],
        '2': [7, 15, 2, 11, 2],
        '1': [3, 6, 1, 1, 7]
    }, index=['Improvement', 'Attitude', 'Cost', 'Personalization', 'Chatbot'])

    df2 = pd.DataFrame({
        '5': [16, 12, 0, 4, 14],
        '4': [26, 39, 11, 13, 17],
        '3': [14, 11, 7, 14, 16],
        '2': [19, 13, 6, 16, 1],
        '1': [5, 5, 0, 1, 0]
    }, index=['Improvement', 'Attitude', 'Cost', 'Personalization', 'Chatbot'])

    # Flatten the data for each construct and perform t-tests
    results = {}
    for construct in df1.index:
        data1 = df1.loc[construct].values
        data2 = df2.loc[construct].values
        ttest_result = ttest_ind(data1, data2)
        results[construct] = ttest_result

    # Print the t-test results
    print("T-Test Results:")
    for construct, result in results.items():
        print(f"{construct}: {result}")

    # Your data ranges
    personalized_group = [0.133334, 0.567597, 0.660423, 0.763489, 0.679546, 0.531277, 0.564357, 0.340786]
    non_personalized_group = [0.411762, 0.730163, 0.770277, 0.763513, 0.641478, 0.502939, 0.670435, 0.470121]

    # Perform the two-sample t-test with unequal variances
    t_statistic, p_value = stats.ttest_ind(personalized_group, non_personalized_group, equal_var=False)

    # Print the results
    print(f"t-statistic = {t_statistic}, p-value = {p_value}")

    # Determine if you have a statistically significant result
    alpha = 0.05
    if p_value < alpha:
        print("Reject the null hypothesis: There is a significant difference between the two groups.")
    else:
        print("Fail to reject the null hypothesis: There is no significant difference between the two groups.")

    # Perform t-tests for each construct
    ttest_results = ttest_constructs(stats_np, stats_p)

    print("T-Test Results:")
    for category, result in ttest_results.items():
        print(f"{category}: {result}")

    # Cronbach alpha for each bucket
    data_reversed = reverse_score(csv_data_post_consolidated, reverse_score_questions)
    # Calculate Cronbach's alpha for each category
    cronbach_alphas = {}
    for category, questions in categories.items():
        category_data = data_reversed[questions].dropna()
        cronbach_alpha = calculate_cronbach_alpha_2(category_data)
        cronbach_alphas[category] = cronbach_alpha

    print("Cronbach's alpha for each category:")
    for category, alpha in cronbach_alphas.items():
        print(f"{category}: {alpha:.2f}")

    # Perform t-test
    group_data_p = csv_data_post_personalized[post_columns]
    group_data_np = csv_data_post_non_personalized[post_columns]
    t_statistic, p_value = perform_t_test(group_data_p, group_data_np)
    print(f"t-test statistic: {t_statistic}")
    print(f"p-value: {p_value}")

    # RQ3 Function to count themes in free response comments
    def count_themes(comments):
        open_response_themes = Counter()
        for comment in comments:
            if "pronunciation" in comment.lower() or "audio quality" in comment.lower():
                open_response_themes["Pronunciation and Quality of Audio"] += 1
            if "enjoy" in comment.lower() or "fun" in comment.lower():
                open_response_themes["Enjoyment and Fun"] += 1
            if "frustrat" in comment.lower() or "bug" in comment.lower() or "issue" in comment.lower():
                open_response_themes["Frustration and Issues"] += 1
            if "effectiveness" in comment.lower() or "learning experience" in comment.lower():
                open_response_themes["Effectiveness and Learning Experience"] += 1
            if "ease of use" in comment.lower() or "ui" in comment.lower():
                open_response_themes["Ease of Use and UI"] += 1
            if "repetitive" in comment.lower() or "sentences" in comment.lower():
                open_response_themes["Repetitiveness of Sentences"] += 1
        return open_response_themes


    # Count themes in personalized and non-personalized comments
    personalized_themes = count_themes(personalized_comments)
    non_personalized_themes = count_themes(non_personalized_comments)

    # Display the themes with their frequencies
    print("Themes in Personalized Group:")
    print(personalized_themes)
    print("\nThemes in Non-Personalized Group:")
    print(non_personalized_themes)
