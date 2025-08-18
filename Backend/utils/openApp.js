import { exec } from "child_process";

export const openSpotify = () => {
  exec("start spotify", (err) => {
    if (err) {
      console.error("Error opening Spotify:", err);
    } else {
      console.log("Spotify opened successfully!");
    }
  });
};
