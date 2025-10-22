const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  {
    name: "Semen & Bahan Perekat",
    description:
      "Berbagai jenis semen, mortar, dan bahan perekat untuk konstruksi",
    icon: "🏗️",
  },
  {
    name: "Pasir & Agregat",
    description:
      "Pasir bangunan, pasir cor, kerikil, dan material agregat lainnya",
    icon: "⛰️",
  },
  {
    name: "Bata & Batako",
    description: "Bata merah, batako, hebel, dan material dinding",
    icon: "🧱",
  },
  {
    name: "Cat & Finishing",
    description: "Cat tembok, cat kayu, cat besi, dan perlengkapan finishing",
    icon: "🎨",
  },
  {
    name: "Keramik & Granit",
    description: "Keramik lantai, keramik dinding, granit, dan marmer",
    icon: "⬜",
  },
  {
    name: "Besi & Baja",
    description: "Besi beton, besi hollow, baja ringan, dan material logam",
    icon: "⚙️",
  },
  {
    name: "Kayu & Plywood",
    description: "Kayu solid, plywood, triplek, dan material kayu olahan",
    icon: "🪵",
  },
  {
    name: "Pipa & Fitting",
    description: "Pipa PVC, pipa galvanis, fitting, dan aksesoris perpipaan",
    icon: "🔧",
  },
  {
    name: "Listrik & Kabel",
    description:
      "Kabel listrik, saklar, stop kontak, dan perlengkapan elektrikal",
    icon: "💡",
  },
  {
    name: "Sanitair & Plumbing",
    description: "Kloset, wastafel, shower, dan perlengkapan kamar mandi",
    icon: "🚿",
  },
  {
    name: "Pintu & Jendela",
    description: "Pintu kayu, pintu aluminium, jendela, dan aksesoris",
    icon: "🚪",
  },
  {
    name: "Atap & Rangka",
    description: "Genteng, asbes, metal roof, dan material atap lainnya",
    icon: "🏠",
  },
  {
    name: "Alat Tukang",
    description: "Palu, gergaji, bor, dan berbagai alat tukang bangunan",
    icon: "🔨",
  },
  {
    name: "Paku & Baut",
    description: "Paku, baut, mur, sekrup, dan pengencang lainnya",
    icon: "📌",
  },
  {
    name: "Lem & Perekat",
    description: "Lem kayu, lem besi, lem keramik, dan berbagai perekat",
    icon: "🧪",
  },
  {
    name: "Gypsum & Partisi",
    description: "Gypsum board, rangka partisi, dan aksesoris plafon",
    icon: "📐",
  },
  {
    name: "Isolasi & Waterproof",
    description: "Material isolasi, waterproofing, dan pelapis anti bocor",
    icon: "💧",
  },
  {
    name: "Kunci & Engsel",
    description: "Handle pintu, engsel, kunci, dan aksesoris hardware",
    icon: "🔑",
  },
  {
    name: "Mesin & Power Tools",
    description: "Mesin bor, gerinda, potong, dan peralatan listrik",
    icon: "⚡",
  },
  {
    name: "Material Dekoratif",
    description: "Wallpaper, vinyl, lisplank, dan material dekorasi",
    icon: "✨",
  },
];

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  for (const category of categories) {
    const slug = category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await prisma.category.upsert({
      where: { slug },
      update: category,
      create: {
        ...category,
        slug,
      },
    });
  }

  console.log(`✅ ${categories.length} categories seeded successfully!`);
}

module.exports = { seedCategories };
