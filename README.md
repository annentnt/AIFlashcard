# NLPUngDung

# Website name: Memoria

## Framework:
- Front-end: React + TailwindCSS
    - UI kit: Hero UI (https://www.heroui.com/)
- Back-end: Django

## Requirements:
1. Create flashcards from different kinds of input:
    - Kinds of input:
        - Structured text
        - Unstructered text (docx, pptx, pdf)
    - From one document, create one topic (one user owns many flashcards)
    - Flashcard structure:
        - Vocabulary
        - Description
    - Creating configuration:
        - Number of flashcards created
    - Filter documents with risk of attack
2. Learn from flashcards:
    - User chooses a topic
        -> Each flashcard pops up to the screen. There will be 3 situations that can happen:
            - User have learnt the word -> Swipe to the right
            - User haven't learnt the word -> Swipe to the left
            - User wants to see the word's description -> Click on the card
        -> At the end of the set, ask if the user wants to relearn the words they haven't got:
            - User clicks "Relearn", pop up the unlearnt words.
            - User clicks "No", get out of the feature.
    - Three modes of learning:
        - Learn new words
        - Relearn unlearnt words
        - Relearn learnt words
        - Learn all words
3. History:
    - For each topic, save 3 informations:
        - New words
        - Unlearnt words
        - Learnt words

4. Edit flashcards:
    - User can edit each flashcard in a topic and save.

5. Word pronunciation:
    - For each flashcard, user can click on the Speaker button to pronounce the word.    

## Stakeholders:
- Admin
- Learner