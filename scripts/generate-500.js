const fs = require('fs');

const CATEGORIES = ["Weapons", "Decoration", "Books", "Attire", "Tools"];
const TYPES = ["Saber", "Vase", "Tome", "Armor", "Relic"];

function generate500() {
  const products = [];
  console.log('🏺 Harvesting 500 unique artifacts from the archives...');

  for (let i = 1; i <= 500; i++) {
    const id = 1000 + i;
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    
    products.push({
      id: id,
      name: `${category.slice(0, -1)} ${type} #${String(i).padStart(3, '0')}`,
      category: category,
      artifactType: type,
      description: `A rare and meticulously preserved ${type} from the Lemurian ${category} collection. Discovered in the forgotten vaults of the sanctuary.`,
      isWeapon: category === "Weapons",
      // These will be served via the GitHub Sanctuary Raw CDN
      image: "https://images.unsplash.com/photo-1599708137303-9ea3586cd9ad?auto=format&fit=crop&q=80",
      model3d: `https://raw.githubusercontent.com/lemuriavawo101-sudo/lemuriashoparchive/main/artifacts/lionguard_sword_and_shield.glb`,
      rotation: 0,
      modelRotation: 0,
      modelRotationX: 0,
      modelRotationZ: 0,
      stock: 'In Stock',
      variants: [
        { size: 'Display Grade', price: Math.floor(Math.random() * 5000) + 1000, old_price: 6000, stock: 50, refillLevel: 5 },
        { size: 'Museum Grade', price: Math.floor(Math.random() * 10000) + 5000, old_price: 15000, stock: 10, refillLevel: 2 }
      ]
    });
  }

  fs.writeFileSync('manifest-500.json', JSON.stringify(products, null, 2));
  console.log('✅ Extraction Complete! Your 500-item manifest is ready in "manifest-500.json".');
}

generate500();
