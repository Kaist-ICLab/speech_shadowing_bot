# Define the questions for each category
categories = {
    "Improvement": [
        "Shadowing is effective in improving listening skills.",
        "Listening skills improve if shadowing improves.",
        "Listening skills improve the more practice shadowing.",
        "Became better at listening after practicing shadowing.",
        "Don’t think shadowing is good for listening skills.",
        "Shadowing is effective in improving pronunciation.",
        "Speaking skills will improve if shadowing improves.",
        "Speaking skills improve the more I practice shadowing.",
        "Pronunciation became better after shadowing.",
        "Don’t think shadowing is good for speaking skills."
    ],
    "Attitude": [
        "Become better at shadowing after each lesson.",
        "It is important to practice shadowing at a faster speed.",
        "Not necessary to practice at a speed faster than I can.",
        "I can become better at shadowing if I practice more.",
        "Feedback is very useful to find mistakes.",
        "Shadowing practice is a valuable learning experience.",
        "Shadowing practice did not assist learning in English.",
        "Recommend shadowing practice to friends.",
        "I will continue shadowing even after completing this session.",
        "I don’t think shadowing improves conversation skills."
    ],
    "Cost": [
        "Practicing shadowing makes me tired.",
        "Frustrated easily when I cannot catch up with the speed.",
        "Shadowing is not painful."
    ],
    "Personalization": [
        "The ChatGPT generated speech shadowing lessons matched my language proficiency.",
        "The generated lessons were appropriately challenging for my current level of English proficiency.",
        "I was satisfied with the diversity of vocabulary and sentence structures in the generated speech shadowing "
        "lessons.",
        "The speech shadowing lessons aligned with my specific language learning preferences and goals.",
        "The speech shadowing lessons effectively catered to my individual learning style.",
        "The generated speech shadowing lessons were consistently personalized based on my individual learning needs."
    ],
    "Chatbot": [
        "Using speech shadowing chatbots makes learning a new language more enjoyable.",
        "I find speech shadowing chatbots easy to use and navigate.",
        "Speech shadowing chatbots provide a valuable addition to traditional language learning methods.",
        "I would be inclined to continue using speech shadowing chatbots for language learning in the future.",
        "Speech shadowing chatbots respect my privacy and data security concerns.",
        "The use of speech shadowing chatbots has positively influenced my overall sentiment toward language learning "
        "with technology."
    ]
}

pre_columns = [
    "I enjoy learning new languages.",
    "Technology helps in my language learning endeavors.",
    "I am comfortable using technology to learn new skills.",
    "I frequently use language learning apps.",
    "I believe personalized learning is beneficial for language acquisition.",
    "I prefer traditional teaching methods over technological aids for language learning.",
    "I am open to using speech shadowing chatbots for language learning.",
    "I am concerned about data privacy and security when using language learning technology.",
    "I believe technology can enhance language learning experiences.",
    "I use ChatGPT for my schoolwork.",
    "I use ChatGPT for language learning."
]

post_columns = [
    "Using speech shadowing chatbots makes learning a new language more enjoyable.",
    "I find speech shadowing chatbots easy to use and navigate.",
    "Speech shadowing chatbots provide a valuable addition to traditional language learning methods.",
    "I would be inclined to continue using speech shadowing chatbots for language learning in the future.",
    "Speech shadowing chatbots respect my privacy and data security concerns.",
    "The use of speech shadowing chatbots has positively influenced my overall sentiment toward language learning "
    "with technology.",
    "Shadowing is effective in improving listening skills.",
    "Listening skills improve if shadowing improves.",
    "Listening skills improve the more practice shadowing.",
    "Became better at listening after practicing shadowing.",
    "Don’t think shadowing is good for listening skills.",
    "Shadowing is effective in improving pronunciation.",
    "Speaking skills will improve if shadowing improves.",
    "Speaking skills improve the more I practice shadowing.",
    "Pronunciation became better after shadowing.",
    "Don’t think shadowing is good for speaking skills.",
    "Become better at shadowing after each lesson.",
    "It is important to practice shadowing at a faster speed.",
    "Not necessary to practice at a speed faster than I can.",
    "I can become better at shadowing if I practice more.",
    "Feedback is very useful to find mistakes.",
    "Shadowing practice is a valuable learning experience.",
    "Shadowing practice did not assist learning in English.",
    "Recommend shadowing practice to friends.",
    "I will continue shadowing even after completing this session.",
    "I don’t think shadowing improves conversation skills.",
    "Practicing shadowing makes me tired.",
    "Frustrated easily when I cannot catch up with the speed.",
    "Shadowing is not painful.",
    "The ChatGPT generated speech shadowing lessons matched my language proficiency.",
    "The generated lessons were appropriately challenging for my current level of English proficiency.",
    "I was satisfied with the diversity of vocabulary and sentence structures in the generated speech shadowing "
    "lessons.",
    "The speech shadowing lessons aligned with my specific language learning preferences and goals.",
    "The speech shadowing lessons effectively catered to my individual learning style.",
    "The generated speech shadowing lessons were consistently personalized based on my individual learning needs."
]

# Define the questions that need their scores reversed
reverse_score_questions = [
    "Don’t think shadowing is good for listening skills.",
    "Don’t think shadowing is good for speaking skills.",
    "Not necessary to practice at a speed faster than I can.",
    "Shadowing practice did not assist learning in English.",
    "I don’t think shadowing improves conversation skills.",
    "Practicing shadowing makes me tired.",
    "Frustrated easily when I cannot catch up with the speed."
]

# Provided free responses
responses = [
    "I selected two topics, book and agriculture. the pronunciations in level 4~6 were so bad.",
    "It was interesting to use a chatbot in shadowing practice. It could have felt more fun without the frequent bug "
    "(it was a bit frustrating). Overall, I enjoyed the whole experience.",
    "I'm no expert in the theory of language acquisition, but overall, the learning process wasn't really enjoyable. "
    "Although it should be noted that I sepak english very proficiently, it seems like shadowing is different from "
    "actually having a conversation. It felt like I was just focusing on the audio simply to remember what the AI was "
    "reading out and to replicate it immediately. In other words, I was shadowing without really 'thinking'. It's "
    "hard for me to say this assists language learning experience. In the end, I got tired of shadowing so I started "
    "to put less effort into doing well. Nonetheless, the UI was very simple and I could tell whoever made this "
    "chatbot put a lot of effort into making it easy to use.",
    "The problem I encountered in the Shadowing lesson's was memorizing large sentences, rather than pronouncing "
    "them. Maybe this should also be taken into account in the future.",
    "I can speak English but memorizing the exact words was hard, I could get what it was trying to convey but not "
    "say it exactly like the chatbot",
    "It's a wonderful project! I really like it. Wish you good luck!",
    "Using this type of platform was a quite interesting experience for me. However, when I used a different laptop ("
    "maybe between the first and second day of my participation), I had to answer the overall pre-survey, so I think "
    "this problem must be solved.",
    "The voice was very monotonous and made it difficult to concentrate.",
    "The structures of the sentences tend to be repetitive"
]

# Define themes
themes = {
    "Pronunciation and Quality of Audio": ["poor", "monotonous", "memorizing large sentences", "exact words"],
    "Enjoyment and Fun": ["interesting", "enjoyed", "wonderful", "good luck", "like"],
    "Frustration and Issues": ["frustrating", "bug", "problem", "difficult", "tired"],
    "Effectiveness and Learning Experience": ["learning process", "shadowing", "assists language learning"],
    "Ease of Use and UI": ["simple", "easy to use", "effort"],
    "Repetitiveness of Sentences": ["repetitive"]
}

# Comments by the personalized group
personalized_comments = [
    "I selected two topics, book and agriculture. the pronunciations in level 4~6 were so bad.",
    "It was interesting to use a chatbot in shadowing practice. It could have felt more fun without the frequent bug "
    "(it was a bit frustrating). Overall, I enjoyed the whole experience.",
    "I'm no expert in the theory of language acquisition, but overall, the learning process wasn't really enjoyable. "
    "Although it should be noted that I speak English very proficiently, it seems like shadowing is different from "
    "actually having a conversation. It felt like I was just focusing on the audio simply to remember what the AI was "
    "reading out and to replicate it immediately. In other words, I was shadowing without really 'thinking'. It's "
    "hard for me to say this assists language learning experience. In the end, I got tired of shadowing so I started "
    "to put less effort into doing well. Nonetheless, the UI was very simple and I could tell whoever made this "
    "chatbot put a lot of effort into making it easy to use.",
    "The problem I encountered in the Shadowing lesson's was memorizing large sentences, rather than pronouncing "
    "them. Maybe this should also be taken into account in the future."
]

# Comments by the non-personalized group
non_personalized_comments = [
    "I can speak English but memorizing the exact words was hard, I could get what it was trying to convey but not "
    "say it exactly like the chatbot",
    "It's a wonderful project! I really like it. Wish you good luck!",
    "Using this type of platform was a quite interesting experience for me. However, when I used a different laptop ("
    "maybe between the first and second day of my participation), I had to answer the overall pre-survey, so I think "
    "this problem must be solved.",
    "The voice was very monotonous and made it difficult to concentrate.",
    "The structures of the sentences tend to be repetitive",
    "There were some technical issues, such as audio is not working or the audio message is not sending. Also, "
    "sometimes the chatbox voice is really fast which is hard to follow it. Also, I think it will be good to consider "
    "different accents on this AI."
]
