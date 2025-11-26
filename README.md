# ServAI Portal

A modern, responsive AI service management platform built with React, TypeScript, and AWS Amplify.

## Features

- 🎨 **Modern UI/UX** - Built with Tailwind CSS and Radix UI components
- 🌙 **Dark/Light Mode** - Theme switching with system preference detection
- 🔐 **AWS Amplify Authentication** - Secure authentication with Cognito
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Vite for optimal development experience
- 🎯 **TypeScript** - Full type safety and better developer experience

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **Authentication**: AWS Amplify with Cognito
- **Routing**: React Router DOM
- **State Management**: React Context + TanStack Query
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account (for Amplify setup)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd serv-ai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_APP_REGION=ap-southeast-2
VITE_APP_USER_POOL_ID=your-user-pool-id
VITE_APP_USER_POOL_CLIENT_ID=your-client-id
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   └── layout/         # Layout components (header, sidebar, etc.)
├── pages/              # Page components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── routes/             # Routing configuration
├── aws/                # AWS Amplify configuration
└── App.tsx             # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## AWS Amplify Setup

1. Create a new Amplify project in the AWS Console
2. Set up Cognito User Pool with the following settings:
   - Phone number as username
   - Email verification disabled
   - Phone number verification enabled
3. Update the configuration in `src/aws/amplifyConfig.ts`

## Customization

### Theme Colors

The application uses CSS custom properties for theming. You can customize colors in `src/index.css`:

```css
:root {
  --primary: 262.1 83.3% 57.8%;  /* Purple */
  --secondary: 210 40% 96%;      /* Light gray */
  /* ... other colors */
}
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/routes/routeConfig.ts`
3. Update the sidebar navigation in `src/components/layout/Sidebar.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
