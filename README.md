# Quickkeys

> Type fast. Track progress. Perfect your rhythm.

![Preview](https://assets.sothearo.dev/images/projects/quickkeys.png)

A minimalist typing speed test with real-time WPM and accuracy tracking.

## TODO

- [ ] Performance charts
- [ ] Multiplayer rooms
- [ ] Progress history
- [ ] Leaderboards

## Custom Themes

Create your theme in `app/assets/css/themes.css`:

```css
.mytheme {
  --primary: oklch(0.7 0.2 195); /* Correct characters */
  --highlight: oklch(0.65 0.2 20); /* Incorrect characters */
  --background: oklch(0.15 0 0); /* Background color */
  --foreground: oklch(0.85 0 0); /* Regular text */
}
```

Add to options in `app/components/app/Header.vue`:

```ts
const options = {
  times: [15, 30, 60, 120],
  themes: [
    "default",
    "dark",
    // ... other themes
    "mytheme",
  ],
  modes: ["words", "sentences"],
} as const;
```

## Contributing

Contributions welcome! Report bugs, request features, or share custom themes.
