# 🏛️ Flappy Heaven

A heavenly Flappy Bird-style game with leaderboards and crypto integration coming soon!

## 🎮 Features

- **Flappy Bird Gameplay**: Navigate an angel through golden heavenly gates
- **Beautiful Graphics**: Heavenly background, golden gates with ethereal effects
- **Leaderboard System**: Real-time score tracking with Supabase
- **Responsive Design**: Works on desktop and mobile
- **Crypto Ready**: UI prepared for Solana wallet integration

## 📁 File Structure

```
heaven/
├── index.html              # Home page with hero section
├── play.html               # Main game with canvas
├── leaderboard.html        # Real-time leaderboard
├── styles.css              # Shared CSS styles
├── test-site.html          # Site test page
├── config.js               # Supabase configuration
├── supabase-setup.sql      # Database setup script
├── README-supabase.md      # Supabase setup guide
├── assets/                 # Game images
│   ├── heaven background.png
│   ├── angel.png
│   ├── gates (2).png
│   ├── heavens gate.png
│   └── clouds.png
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Test the Site Locally

1. Open `test-site.html` in your browser to see the site overview
2. Click the navigation links to test each page
3. Try the game at `play.html` - it works completely offline!

### 2. Set Up Supabase (Optional - for leaderboards)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `supabase-setup.sql`
3. Get your project URL and anon key from Settings → API
4. Update the configuration in `play.html` and `leaderboard.html`

## 🎯 How to Play

1. **Start Game**: Click "Start Game" on the play page
2. **Controls**: 
   - Press SPACEBAR to flap
   - Click/tap to flap
   - Navigate through the golden gates
3. **Scoring**: Each gate you pass gives you 1 point
4. **Game Over**: Hit a gate or the screen boundaries
5. **Submit Score**: Enter your name and submit to the leaderboard

## 🔧 Configuration

### Supabase Setup (for leaderboards)

Replace these placeholders in both `play.html` and `leaderboard.html`:

```javascript
const SUPABASE_URL = 'SUPABASE_URL';        // Your Supabase project URL
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY'; // Your Supabase anon key
```

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the script to create the scores table

## 🎨 Customization

### Colors and Themes
- **Primary**: Golden/yellow theme for heavenly gates
- **Background**: Sky blue with heavenly background image
- **UI**: Clean white with blue accents

### Game Settings
- **Difficulty**: Automatically increases every 5 points
- **Gates**: Golden rectangles with ethereal glow effects
- **Angel**: Flipped horizontally to face the correct direction

## 📱 Mobile Support

The site is fully responsive and works on:
- Desktop browsers
- Mobile phones
- Tablets
- Touch devices

## 🔮 Future Features

- **Solana Wallet Integration**: Connect wallets for paid play
- **Prize Pool**: Real-time token balance display
- **Entry Fees**: Pay-to-play with rewards
- **On-chain Rewards**: Claim prizes directly on Solana

## 🐛 Troubleshooting

### Game Not Loading
- Check that all image files are in the `assets/` folder
- Ensure JavaScript is enabled in your browser

### Leaderboard Not Working
- Verify Supabase configuration is correct
- Check browser console for API errors
- Ensure the scores table exists in your Supabase project

### Images Not Showing
- Verify file paths in the code match your actual file names
- Check that image files are not corrupted

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all files are present in the correct locations
3. Test with the `test-site.html` page first

## 🎉 Success!

Once everything is set up, you'll have:
- ✅ A fully functional Flappy Bird-style game
- ✅ Beautiful heavenly graphics and effects
- ✅ Real-time leaderboard with Supabase
- ✅ Responsive design for all devices
- ✅ Foundation for crypto integration

Enjoy playing Flappy Heaven! 🏛️✨
