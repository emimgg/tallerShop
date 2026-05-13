const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  if (count > 0) {
    console.log('Already seeded, skipping.')
    return
  }

  const servicios = [
    'Desarme', 'Armado', 'Cambio de aceite', 'Cambio de frenos', 'Cambio de correa',
    'Reparación de motor', 'Reparación de caja', 'Alineación', 'Balanceo', 'Vulcanización',
    'Diagnóstico', 'Revisión general', 'Cambio de embrague', 'Cambio de amortiguadores',
    'Cambio de batería', 'Cambio de bujías', 'Cambio de filtros', 'Lavado de motor',
    'Pintura', 'Soldadura',
  ].map(name => ({ name, category: 'servicio', price: 0, stock: 0 }))

  const partes = [
    'Pastillas de freno', 'Disco de freno', 'Zapatas', 'Tambor de freno',
    'Amortiguador delantero', 'Amortiguador trasero', 'Resorte', 'Buje', 'Rotula', 'Manga de eje',
    'Correa de distribución', 'Correa de alternador', 'Tensor de correa', 'Bomba de agua',
    'Termostato', 'Radiador', 'Manguera de radiador', 'Bomba de combustible',
    'Filtro de combustible', 'Filtro de aire', 'Filtro de aceite', 'Filtro de habitáculo',
    'Bujías', 'Cables de bujías', 'Bobina de encendido', 'Alternador', 'Arrancador', 'Batería',
    'Fusibles', 'Relay', 'Embrague', 'Disco de embrague', 'Plato presor', 'Cojinete de empuje',
    'Palier', 'Junta homocinética', 'Diferencial', 'Caja de dirección', 'Terminales de dirección',
    'Brazo de dirección', 'Cremallera', 'Bomba de dirección hidráulica', 'Manguera de dirección',
    'Catalizador', 'Silenciador', 'Caño de escape', 'Junta de culata', 'Pistón',
    'Anillos de pistón', 'Biela', 'Cigüeñal', 'Árbol de levas', 'Válvulas',
    'Retén de válvula', 'Bomba de aceite', 'Cárter',
  ].map(name => ({ name, category: 'parte', price: 0, stock: 0 }))

  const otros = [
    'Aceite de motor 5W30', 'Aceite de motor 10W40', 'Aceite de motor 20W50',
    'Aceite de caja', 'Aceite de diferencial', 'Aceite de dirección hidráulica',
    'Líquido de frenos DOT4', 'Líquido refrigerante', 'Líquido limpiaparabrisas',
    'Grasa de chasis', 'Grasa de rodamientos', 'Sellador de juntas', 'Silicona',
    'Limpiador de frenos', 'Limpiador de carburador', 'Desengrasante', 'Anticorrosivo',
    'Cinta aislante', 'Cinta vulcanizante', 'Trapos industriales',
  ].map(name => ({ name, category: 'otro', price: 0, stock: 0 }))

  await prisma.product.createMany({ data: [...servicios, ...partes, ...otros] })
  console.log(`Seeded ${servicios.length + partes.length + otros.length} products.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
