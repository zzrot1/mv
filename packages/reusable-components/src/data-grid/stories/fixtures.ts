import type { ServerGridQuery } from "../application/server-query";
import { normalizeText } from "../domain/values";

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: "Fiction" | "History" | "Poetry" | "Science";
  price: number;
  stock: number;
  bestseller: boolean;
  publishedAt: Date;
};

export type Member = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  team: string;
  age: number | null;
  active: boolean;
};

const book = (
  id: number,
  title: string,
  author: string,
  genre: Book["genre"],
  price: number,
  stock: number,
  bestseller: boolean,
  year: number,
): Book => ({
  author,
  bestseller,
  genre,
  id: `b${id}`,
  price,
  publishedAt: new Date(Date.UTC(year, 0, 1)),
  stock,
  title,
});

export const books: Book[] = [
  book(1, "Amintiri din copilărie", "Ion Creangă", "Fiction", 39.9, 12, true, 1892),
  book(2, "Baltagul", "Mihail Sadoveanu", "Fiction", 34.5, 0, false, 1930),
  book(3, "Enigma Otiliei", "George Călinescu", "Fiction", 45, 4, true, 1938),
  book(4, "Istoria românilor", "Nicolae Iorga", "History", 120, 2, false, 1937),
  book(5, "Luceafărul", "Mihai Eminescu", "Poetry", 25, 30, true, 1883),
  book(6, "Sapiens", "Yuval Noah Harari", "History", 59.9, 8, true, 2011),
  book(7, "Cosmos", "Carl Sagan", "Science", 64, 0, false, 1980),
  book(8, "Plumb", "George Bacovia", "Poetry", 22, 6, false, 1916),
  book(9, "Ion", "Liviu Rebreanu", "Fiction", 42, 9, true, 1920),
  book(10, "Pădurea spânzuraților", "Liviu Rebreanu", "Fiction", 41, 3, false, 1922),
  book(11, "A Brief History of Time", "Stephen Hawking", "Science", 55, 11, true, 1988),
  book(12, "Moara cu noroc", "Ioan Slavici", "Fiction", 28, 0, false, 1881),
  book(13, "Testament", "Tudor Arghezi", "Poetry", 24, 5, false, 1927),
  book(14, "The Selfish Gene", "Richard Dawkins", "Science", 58, 7, false, 1976),
  book(15, "Maitreyi", "Mircea Eliade", "Fiction", 38, 14, true, 1933),
  book(16, "Jurnalul fericirii", "Nicolae Steinhardt", "History", 49, 1, false, 1991),
  book(17, "Ultima noapte de dragoste", "Camil Petrescu", "Fiction", 36, 0, false, 1930),
  book(18, "On the Origin of Species", "Charles Darwin", "Science", 47, 4, false, 1859),
  book(19, "Necuvintele", "Nichita Stănescu", "Poetry", 31, 9, true, 1969),
  book(20, "Istoria Imperiului Otoman", "Nicolae Iorga", "History", 98, 0, false, 1908),
  book(21, "Cel mai iubit dintre pământeni", "Marin Preda", "Fiction", 52, 6, true, 1980),
  book(22, "The Gene", "Siddhartha Mukherjee", "Science", 62, 10, false, 2016),
  book(23, "Moromeții", "Marin Preda", "Fiction", 44, 13, true, 1955),
];

const member = (
  id: number,
  name: string,
  role: Member["role"],
  team: string,
  age: number | null,
  active: boolean,
): Member => ({
  active,
  age,
  email: `${normalizeText(name).replace(/\s+/g, ".")}@example.com`,
  id,
  name,
  role,
  team,
});

export const members: Member[] = [
  member(1, "Ana Pop", "Admin", "Platform", 34, true),
  member(2, "Bogdan Ionescu", "Editor", "Content", 28, true),
  member(3, "Cristina Marin", "Viewer", "Sales", null, false),
  member(4, "Dan Popescu", "Editor", "Platform", 41, true),
  member(5, "Elena Rusu", "Admin", "Security", 37, true),
  member(6, "Florin Stan", "Viewer", "Sales", 25, true),
  member(7, "Gabriela Dumitru", "Editor", "Content", 31, false),
  member(8, "Horia Matei", "Viewer", "Support", 45, true),
  member(9, "Ioana Pop", "Editor", "Support", 29, true),
  member(10, "Mihai Marin", "Admin", "Platform", 52, true),
  member(11, "Ștefan Rusu", "Viewer", "Security", 39, false),
  member(12, "Teodora Ilie", "Editor", "Content", 33, true),
  member(13, "Radu Pop", "Viewer", "Sales", 47, true),
  member(14, "Oana Stan", "Admin", "Support", 26, true),
  member(15, "Victor Dinu", "Editor", "Platform", null, true),
  member(16, "Laura Neagu", "Viewer", "Security", 36, false),
];

export const roleOptions = (["Admin", "Editor", "Viewer"] as const).map((role) => ({
  label: role,
  value: role,
}));

export function queryMembers(query: ServerGridQuery) {
  const search = normalizeText(query.filters?.search ?? "");
  const role = query.columnFilters?.role;
  const sort = query.sorting?.[0];
  const { pageIndex = 0, pageSize = 10 } = query.pagination ?? {};

  const rows = members
    .filter((person) => !search || normalizeText(person.name).includes(search))
    .filter((person) => !role || person.role === role)
    .sort((a, b) => {
      if (!sort) {
        return 0;
      }

      const left = String(a[sort.id as keyof Member] ?? "");
      const right = String(b[sort.id as keyof Member] ?? "");

      return left.localeCompare(right) * (sort.desc ? -1 : 1);
    });

  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length };
}
