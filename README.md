# SceneLingo

SceneLingo is an intelligent English learning companion designed to help users master natural phrasing for specific real-life situations. Powered by Google's Gemini AI, it instantly transforms text descriptions or visual inputs into comprehensive learning cards.

## Features

- **AI-Powered Scenario Analysis**: Leverages Google Gemini to deconstruct scenarios into learnable content.
- **Visual & Text Input**: Support for both typing scenarios (e.g., "Ordering coffee") and uploading images.
- **Structured Learning Cards**: Each generated card includes:
  - **Chinese Title**: A concise summary of the situation.
  - **Main Phrase**: The key English expression to use.
  - **IPA Pronunciation**: Accurate pronunciation guide.
  - **Contextual Explanation**: Why and when to use the phrase.
  - **Example Sentence**: A complete sentence demonstrating usage.
  - **Related Vocabulary**: Useful words associated with the scenario.
- **Personal Knowledge Base**: Automatically saves your scenarios to the cloud.
- **Review Mode**: Randomly resurface past cards to reinforce memory.
- **Clean & Responsive UI**: Built for focus and usability on any device.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini (via `@google/genai`)
- **Backend Services**: Firebase (Authentication & Firestore)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Cloud Project with Gemini API access
- A Firebase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SceneLingo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   *Note: Ensure your Firebase configuration in `services/firebase.ts` is correctly set up with your project credentials.*

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Usage

1. **Describe or Snap**: Type a situation you want to learn about, or upload a photo of the scene.
2. **Learn**: Instantaneously receive a curated card with the perfect phrase and context.
3. **Save & Review**: The app saves your cards. Use the "Review" button to practice random scenarios from your collection.

## License

MIT