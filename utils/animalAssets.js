const ANIMALS = [
  { id: 'dino', label: 'Dinosaurio', image: require('@/assets/images/Dino.jpg') },
  { id: 'koala', label: 'koala', image: require('@/assets/images/Dino.jpg') },
  { id: 'gato', label: 'Gato', image: require('@/assets/images/Dino.jpg') },
  { id: 'leon', label: 'León', image: require('@/assets/images/Dino.jpg') },
];


export function getAnimalById(id) {
  return ANIMALS.find((a) => a.id === id) ?? null;
}
 