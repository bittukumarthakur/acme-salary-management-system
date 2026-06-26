import { createApp } from './app';

const main = async () => {
  const PORT = process.env.PORT || 8000;

  createApp().listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main();
