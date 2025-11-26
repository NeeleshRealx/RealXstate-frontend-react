# Manual Order Entry System

## Overview
The Manual Order Entry system provides a chat-simulated interface that replicates the customer ordering experience through WhatsApp/WeChat, allowing restaurant staff to manually enter orders with comprehensive order management capabilities.

## Features

### 🎯 Core Functionality
- **Chat Simulation Interface**: Natural conversation flow with customers
- **Real-time Order Management**: Live order updates and pricing calculations
- **Menu Integration**: Seamless menu item selection and addition
- **Order Context Management**: Branch, table, and customer information
- **Pricing Calculations**: Automatic tax, service charge, and total calculations

### 💬 Chat Interface
- **Message Bubbles**: System (blue) and customer (gray) message styling
- **Order Notifications**: Real-time item addition confirmations
- **Natural Language Processing**: Smart item detection from customer messages
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line, Ctrl/Cmd+K to focus input

### 🍽️ Menu Integration
- **Category-based Navigation**: Starters, Pizzas, Pasta, Drinks, Popular Items
- **Quick Item Addition**: One-click menu item selection
- **Smart Suggestions**: Popular items and category-based recommendations
- **Natural Language Recognition**: Automatic item detection from text

### 📊 Order Management
- **Live Order Summary**: Real-time item list and pricing
- **Quantity Management**: Easy quantity adjustment with +/- buttons
- **Item Removal**: Quick item deletion with trash icon
- **Notes System**: Separate kitchen and customer notes
- **Order Status**: Draft, Sent to Kitchen, In Progress, Ready, Completed

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Loading States**: Progress indicators for all operations
- **Error Handling**: Comprehensive error messages and validation
- **Auto-save**: Automatic draft saving functionality

## File Structure

```
src/
├── pages/
│   └── ManualOrderEntry.tsx          # Main order entry page
├── components/order/
│   ├── ChatMessage.tsx               # Individual chat message component
│   ├── OrderItemCard.tsx             # Order item display and management
│   ├── PricingBreakdown.tsx          # Order pricing calculations
│   ├── QuickActionButtons.tsx        # Menu category navigation
│   ├── MessageInput.tsx              # Chat input with attachments
│   └── OrderContextHeader.tsx        # Branch/table/customer selection
└── services/
    └── menuIntegrationService.ts     # Menu data and NLP processing
```

## Usage

### Accessing the System
1. Navigate to `/orders/manual-entry` in the application
2. Select a branch and table from the dropdown menus
3. Optionally enter customer name or phone number
4. Start the chat simulation to take orders

### Taking Orders
1. **Chat Method**: Type customer messages and let the system process them
2. **Menu Method**: Click category buttons to show menu items and add them directly
3. **Natural Language**: The system understands phrases like:
   - "I'd like 2 margherita pizzas"
   - "Add a coke to my order"
   - "Can I get garlic bread with cheese?"

### Order Management
- **Add Items**: Use chat or menu buttons to add items
- **Adjust Quantities**: Use +/- buttons on order items
- **Remove Items**: Click trash icon to remove items
- **Add Notes**: Use kitchen and customer note fields
- **Save Draft**: Save order as draft for later completion
- **Send to Kitchen**: Submit order to kitchen for preparation

## Technical Implementation

### State Management
- **Order Context**: Branch, table, customer information
- **Order Items**: Array of items with quantities and pricing
- **Chat Messages**: Conversation history with timestamps
- **UI State**: Loading states, error handling, form validation

### API Integration
- **Order Service**: Create, update, and manage orders
- **Table Service**: Fetch available tables for selected branch
- **Menu Integration**: Process natural language and menu data

### Responsive Design
- **Mobile (320px-768px)**: Stacked layout with simplified chat
- **Tablet (768px-1024px)**: 2-panel layout
- **Desktop (1024px+)**: Full 3-panel layout

### Accessibility Features
- **ARIA Labels**: Proper labeling for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA attributes
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliant color schemes

## Menu Integration Service

The `menuIntegrationService` provides:
- **Natural Language Processing**: Converts customer messages to order items
- **Menu Data Management**: Handles menu items, categories, and pricing
- **Smart Suggestions**: Recommends items based on current order
- **Quantity Extraction**: Automatically detects quantities from text

### Supported Menu Items
- **Pizzas**: Margherita, Pepperoni, and more
- **Starters**: Caesar Salad, Garlic Bread, Chicken Wings
- **Pasta**: Spaghetti Carbonara and other pasta dishes
- **Drinks**: Coca Cola, Orange Juice, and other beverages

## Order Flow

1. **Setup**: Select branch, table, and customer information
2. **Order Taking**: Use chat or menu to add items
3. **Review**: Check order summary and pricing
4. **Notes**: Add kitchen and customer notes if needed
5. **Submit**: Save as draft or send to kitchen
6. **Track**: Monitor order status through the system

## Error Handling

- **Validation**: Form validation for required fields
- **API Errors**: Graceful handling of network and server errors
- **User Feedback**: Toast notifications for all actions
- **Loading States**: Visual feedback during operations

## Future Enhancements

- **Discount Management**: Apply percentage or fixed discounts
- **Order Modifications**: Edit existing orders
- **Payment Integration**: Process payments within the system
- **Order History**: View and manage past orders
- **Advanced NLP**: More sophisticated natural language processing
- **Voice Input**: Speech-to-text for order taking
- **Multi-language Support**: Support for multiple languages

## Testing

The system includes comprehensive testing for:
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Complete order flow testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Responsive Tests**: Cross-device compatibility

## Performance Considerations

- **Efficient Rendering**: Optimized chat message rendering
- **Real-time Updates**: Fast order summary updates
- **Menu Caching**: Cached menu data for quick access
- **Bundle Optimization**: Code splitting and lazy loading
- **Memory Management**: Proper cleanup of event listeners

This Manual Order Entry system provides a complete solution for restaurant staff to efficiently take orders through a simulated chat interface, combining the familiarity of messaging apps with powerful order management capabilities.
