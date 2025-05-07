# NLPUngDung

# Website name: Memoria

## Framework:
- Front-end: React + TailwindCSS
    - UI kit: Hero UI (https://www.heroui.com/)
- Back-end: Django

## Requirements:
1. Create flashcards from different kinds of input: **DONE**
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

3. History: --> TRANG
    - For each topic, save 3 informations:
        - New words
        - Unlearnt words
        - Learnt words

4. Edit flashcards: **DONE**
    - User can edit each flashcard in a topic and save.

5. Word pronunciation: **DONE**
    - For each flashcard, user can click on the Speaker button to display IPA of the word.
    - If user wants to listen to pronunciation of the word, click on the "Play" button next to the IPA.
        -> Pronunciation learning

6. Pronunciation learning: --> LINH **DONE**
    - If user wants to check his/her pronunciation and compare it with the word pronunciation, click on "Check your pronunciation".
    - System checks user's pronunciation and score it, then send it back to user. User can retry pronunciation checking to reach a higher score.

<!-- 7. Intonation learning:
    - After learning a word's pronunciation, if user wants to pronounce it in a sentence example, user can enter "Intonation practice", system will generate a sentence including the word. Then user checks intonation and receive a score. -->

8. QnA Chatbot: **DONE**
    - If user wants to ask about a vocabulary in any topic they have created, user can use Chatbot to ask.
    - Chatbot will answer to user information about the word user asked. Note that all information the chatbot answers is from the document user submit, not related to any extra information.

## Technical implementation
1. Create a set of flashcards: **DONE**
    - User submit a document with some config numbers (number of flashcards created) -> FE sends the document to BE through API post request -> BE calls ChatGPT API to extract vocabularies in the document (abort if the document contains violent content)-> BE sends back to FE the extracted data -> FE displays the data in the form of a flashcard set and allows user to adjust each flashcard -> User confirms creating the final flashcard set -> FE sends the final set to BE and BE saves the set to database.

- Knowledge graph --> PHÚC **DONE**
- Flashcard similarity when displaying flashcards in "Learning with flashcards" --> PHÚC **DONE**

## Stakeholders:
- Admin
- Learner

## Questions:
- Giới hạn độ dài của file input.
- Đánh giá kết quả tạo flashcards từ API.