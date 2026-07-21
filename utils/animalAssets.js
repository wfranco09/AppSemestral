export const ANIMALS = [
  {
    id: "dino",
    label: "Dinosaurio",
    image: require("@/assets/images/Dino.jpg"),
  },
  {
    id: "koala",
    label: "Koala",
    image: require("@/assets/images/koala.jpg"),
  },
  {
    id: "gato",
    label: "Gato",
    image: require("@/assets/images/Gato.jpg"),
  },
  {
    id: "leon",
    label: "León",
    image: require("@/assets/images/Leon.png"),
  },
];


export function getAnimalById(id) {
  return ANIMALS.find((a) => a.id === id) ?? null;
}
 