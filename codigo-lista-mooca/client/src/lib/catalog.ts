export type ProductCategory =
  | "Mercearia"
  | "Bebidas"
  | "Laticínios e frios"
  | "Hortifruti"
  | "Limpeza"
  | "Higiene"
  | "Congelados";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: ProductCategory;
};

// Base inicial demonstrativa. Preços podem mudar por loja, data e promoção.
export const initialProducts: Product[] = [
  { id: "arroz-camil-5kg", name: "Arroz branco 5 kg", brand: "Camil", price: 31.9, category: "Mercearia" },
  { id: "feijao-camil-1kg", name: "Feijão carioca 1 kg", brand: "Camil", price: 8.49, category: "Mercearia" },
  { id: "macarrao-renata-500g", name: "Macarrão espaguete 500 g", brand: "Renata", price: 4.79, category: "Mercearia" },
  { id: "oleo-liza-900ml", name: "Óleo de soja 900 ml", brand: "Liza", price: 7.29, category: "Mercearia" },
  { id: "acucar-uniao-5kg", name: "Açúcar refinado 5 kg", brand: "União", price: 18.9, category: "Mercearia" },
  { id: "cafe-pilao-500g", name: "Café torrado e moído 500 g", brand: "Pilão", price: 24.9, category: "Mercearia" },
  { id: "farinha-dona-benta-1kg", name: "Farinha de trigo 1 kg", brand: "Dona Benta", price: 5.99, category: "Mercearia" },
  { id: "molho-pomarola-300g", name: "Molho de tomate 300 g", brand: "Pomarola", price: 2.99, category: "Mercearia" },
  { id: "refrigerante-coca-2l", name: "Refrigerante cola 2 L", brand: "Coca-Cola", price: 10.49, category: "Bebidas" },
  { id: "agua-crystal-15l", name: "Água mineral sem gás 1,5 L", brand: "Crystal", price: 2.49, category: "Bebidas" },
  { id: "suco-del-valle-1l", name: "Suco de uva 1 L", brand: "Del Valle", price: 8.99, category: "Bebidas" },
  { id: "cerveja-heineken-lata", name: "Cerveja lata 350 ml", brand: "Heineken", price: 4.99, category: "Bebidas" },
  { id: "leite-ninho-1l", name: "Leite integral 1 L", brand: "Ninho", price: 5.49, category: "Laticínios e frios" },
  { id: "margarina-qualy-500g", name: "Margarina 500 g", brand: "Qualy", price: 8.49, category: "Laticínios e frios" },
  { id: "muçarela-sadia-150g", name: "Queijo muçarela fatiado 150 g", brand: "Sadia", price: 12.9, category: "Laticínios e frios" },
  { id: "iogurte-vigor-1l", name: "Iogurte natural 1 L", brand: "Vigor", price: 10.9, category: "Laticínios e frios" },
  { id: "banana-prata-kg", name: "Banana prata (kg)", brand: "Assaí", price: 6.99, category: "Hortifruti" },
  { id: "tomate-kg", name: "Tomate comum (kg)", brand: "Assaí", price: 7.99, category: "Hortifruti" },
  { id: "batata-kg", name: "Batata lavada (kg)", brand: "Assaí", price: 5.49, category: "Hortifruti" },
  { id: "cebola-kg", name: "Cebola (kg)", brand: "Assaí", price: 4.99, category: "Hortifruti" },
  { id: "detergente-ype-500ml", name: "Detergente líquido 500 ml", brand: "Ypê", price: 2.29, category: "Limpeza" },
  { id: "sabao-po-o-mo-2kg", name: "Sabão em pó 2 kg", brand: "Omo", price: 24.9, category: "Limpeza" },
  { id: "amaciante-confort-2l", name: "Amaciante 2 L", brand: "Comfort", price: 16.9, category: "Limpeza" },
  { id: "papel-toalha-sophia", name: "Papel-toalha 2 rolos", brand: "Soffia", price: 6.49, category: "Limpeza" },
  { id: "papel-higienico-personal", name: "Papel higiênico 12 rolos", brand: "Personal", price: 18.9, category: "Higiene" },
  { id: "shampoo-pantene-350ml", name: "Shampoo 350 ml", brand: "Pantene", price: 18.49, category: "Higiene" },
  { id: "creme-dental-colgate", name: "Creme dental 90 g", brand: "Colgate", price: 4.49, category: "Higiene" },
  { id: "sabonete-dove", name: "Sabonete 90 g", brand: "Dove", price: 4.99, category: "Higiene" },
  { id: "frango-sadia-1kg", name: "Filé de peito de frango 1 kg", brand: "Sadia", price: 18.9, category: "Congelados" },
  { id: "lasanha-sadia-600g", name: "Lasanha congelada 600 g", brand: "Sadia", price: 14.9, category: "Congelados" },
  { id: "hamburguer-seara-672g", name: "Hambúrguer bovino 672 g", brand: "Seara", price: 15.9, category: "Congelados" },
];

export const categories: Array<ProductCategory | "Todos"> = [
  "Todos",
  "Mercearia",
  "Bebidas",
  "Laticínios e frios",
  "Hortifruti",
  "Limpeza",
  "Higiene",
  "Congelados",
];

export function normalizeProduct(value: Partial<Product>, index: number): Product | null {
  const name = String(value.name ?? "").trim();
  const brand = String(value.brand ?? "").trim();
  const price = Number(value.price);
  const category = String(value.category ?? "Mercearia");
  if (!name || !brand || !Number.isFinite(price) || price < 0) return null;
  return {
    id: String(value.id ?? `${name}-${brand}-${index}`).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    brand,
    price,
    category: categories.includes(category as ProductCategory) && category !== "Todos" ? category as ProductCategory : "Mercearia",
  };
}
