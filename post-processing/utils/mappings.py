# Define the columns to reverse-score
reverse_columns_mapping = {
    'Lt5': 'Don’t think shadowing is good for listening skills.',
    'Sp5': 'Don’t think shadowing is good for speaking skills.',
    'Pf3': 'Not necessary to practice at a speed faster than I can.',
    'Sf2': 'Shadowing practice did not assist learning in English.',
    'Sf5': 'I don’t think shadowing improves conversation skills.',
    'Ct1': 'Practicing shadowing makes me tired.',
    'Ct2': 'Frustrated easily when I cannot catch up with the speed.'
}

# Exclude specified items based on your criteria
exclude_columns_mapping = {
    'Lt3': 'Listening skills improve the more practice shadowing.',
    'Lt4': 'Became better at listening after practicing shadowing.',
    'Lt5': 'Don’t think shadowing is good for listening skills.',
    'Sp1': 'Shadowing is effective in improving pronunciation.',
    'Sp2': 'Speaking skills will improve if shadowing improves.',
    'Sp5': 'Don’t think shadowing is good for speaking skills.'
}

# Which group each participant is in
p_or_np = {
    "P": [
        "P1",
        "P2",
        "P3",
        "P4",
        "P5",
        "P6"
    ],
    "NP": [
        "N1",
        "N2",
        "N3",
        "N4",
        "N5",
        "N6",
        "N7",
        "N8"
    ]
}

abbreviations = {
    "Lt1": "Shadowing is effective in improving listening skills.",
    "Lt2": "Listening skills improve if shadowing improves.",
    "Lt3": "Listening skills improve the more practice shadowing.",
    "Lt4": "Became better at listening after practicing shadowing.",
    "Lt5": "Don’t think shadowing is good for listening skills.",
    "Sp1": "Shadowing is effective in improving pronunciation.",
    "Sp2": "Speaking skills will improve if shadowing improves.",
    "Sp3": "Speaking skills improve the more I practice shadowing.",
    "Sp4": "Pronunciation became better after shadowing.",
    "Sp5": "Don’t think shadowing is good for speaking skills.",
    "Pf1":	"Become better at shadowing after each lesson.",
    "Pf2": "It is important to practice shadowing at a faster speed.",
    "Pf3": "Not necessary to practice at a speed faster than I can.",
    "Pf4": "I can become better at shadowing if I practice more.",
    "Pf5": "Feedback is very useful to find mistakes.",
    "Sf1":	"Shadowing practice is a valuable learning experience.",
    "Sf2": "Shadowing practice did not assist learning in English.",
    "Sf3": "Recommend shadowing practice to friends.",
    "Sf4": "I will continue shadowing even after completing this session.",
    "Sf5": "I don’t think shadowing improves conversation skills.",
    "Ct1": "Practicing shadowing makes me tired.",
    "Ct2": "Frustrated easily when I cannot catch up with the speed.",
    "Ct3": "Shadowing is not painful.",
    "Pe1": "The ChatGPT generated speech shadowing lessons matched my language proficiency.",
    "Pe2": "The generated lessons were appropriately challenging for my current level of English proficiency.",
    "Pe3": "I was satisfied with the diversity of vocabulary and sentence structures in the generated speech shadowing "
    "lessons.",
    "Pe4": "The speech shadowing lessons aligned with my specific language learning preferences and goals.",
    "Pe5": "The speech shadowing lessons effectively catered to my individual learning style.",
    "Pe6": "The generated speech shadowing lessons were consistently personalized based on my individual learning "
           "needs.",
    "Ch1": "Using speech shadowing chatbots makes learning a new language more enjoyable.",
    "Ch2": "I find speech shadowing chatbots easy to use and navigate.",
    "Ch3": "Speech shadowing chatbots provide a valuable addition to traditional language learning methods.",
    "Ch4": "I would be inclined to continue using speech shadowing chatbots for language learning in the future.",
    "Ch5": "Speech shadowing chatbots respect my privacy and data security concerns.",
    "Ch6": "The use of speech shadowing chatbots has positively influenced my overall sentiment toward language "
    "learning with technology.",
}
