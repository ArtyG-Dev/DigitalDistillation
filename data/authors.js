/* Digital Distillation — author roster.
   To add an author: append one object here, then add their entries to entries.new.js
   (or entries.c21.js) with a matching `au` value. The tabs, colours, counts and indexes
   rebuild themselves.

   `id` must also exist as a `.a-<id>` rule in assets/styles.css.
   `era` must be one of the groups listed in DD_ERAS below — it drives the tab grouping. */

window.DD_ERAS = ["Success canon", "Critical thought", "Diaspora thought", "21st century"];

window.DD_AUTHORS = [
  { id: "rohn",       name: "Jim Rohn",              years: "1930\u20132009", note: "American business philosopher; mentor to a generation of speakers.",              era: "Success canon" },
  { id: "carnegie",   name: "Dale Carnegie",         years: "1888\u20131955", note: "Lecturer on human relations and public speaking.",                               era: "Success canon" },
  { id: "hill",       name: "Napoleon Hill",         years: "1883\u20131970", note: "Author of Think and Grow Rich. See README on disputed biography.",               era: "Success canon" },
  { id: "covey",      name: "Stephen R. Covey",      years: "1932\u20132012", note: "Educator; author of The 7 Habits of Highly Effective People.",                   era: "Success canon" },
  { id: "robbins",    name: "Tony Robbins",          years: "b. 1960",        note: "Strategist and speaker; studied under Jim Rohn early in his career.",             era: "Success canon" },

  { id: "frankl",     name: "Viktor Frankl",         years: "1905\u20131997", note: "Austrian neurologist and psychiatrist; founder of logotherapy.",                 era: "Critical thought" },
  { id: "drucker",    name: "Peter Drucker",         years: "1909\u20132005", note: "Writer and consultant; effectively invented modern management.",                 era: "Critical thought" },
  { id: "tyson",      name: "Neil deGrasse Tyson",   years: "b. 1958",        note: "Astrophysicist and science communicator; director of the Hayden Planetarium.",    era: "Critical thought" },
  { id: "chomsky",    name: "Noam Chomsky",          years: "b. 1928",        note: "Linguist and political critic; co-author of the propaganda model.",              era: "Critical thought" },
  { id: "singer",     name: "Peter Singer",          years: "b. 1946",        note: "Moral philosopher; obligation at a distance and the interests of animals.",      era: "Critical thought" },

  { id: "douglass",   name: "Frederick Douglass",    years: "1818\u20131895", note: "Abolitionist, orator and memoirist; escaped slavery and argued the nation into its own creed.", era: "Diaspora thought" },
  { id: "dubois",     name: "W. E. B. Du Bois",      years: "1868\u20131963", note: "Sociologist and historian; first Black doctorate from Harvard.",                 era: "Diaspora thought" },
  { id: "thurman",    name: "Howard Thurman",        years: "1899\u20131981", note: "Theologian and mystic; intellectual wellspring of the civil rights movement.",   era: "Diaspora thought" },
  { id: "baldwin",    name: "James Baldwin",         years: "1924\u20131987", note: "Novelist and essayist; moral witness of the American century.",                  era: "Diaspora thought" },
  { id: "angelou",    name: "Maya Angelou",          years: "1928\u20132014", note: "Poet and memoirist; chronicler of survival and self-possession.",                era: "Diaspora thought" },
  { id: "morrison",   name: "Toni Morrison",         years: "1931\u20132019", note: "Novelist and editor; Nobel laureate in Literature.",                             era: "Diaspora thought" },

  { id: "bryant",     name: "John Hope Bryant",      years: "b. 1966",        note: "Founder of Operation HOPE; financial dignity and \u201csilver rights\u201d.",       era: "21st century" },
  { id: "kahneman",   name: "Daniel Kahneman",       years: "1934\u20132024", note: "Psychologist; Nobel laureate in Economics for work on judgement under uncertainty.", era: "21st century" },
  { id: "dweck",      name: "Carol Dweck",           years: "b. 1946",        note: "Psychologist at Stanford; originator of mindset theory.",                         era: "21st century" },
  { id: "brown",      name: "Bren\u00e9 Brown",         years: "b. 1965",        note: "Research professor; vulnerability, shame and courage.",                          era: "21st century" },
  { id: "clear",      name: "James Clear",           years: "b. 1986",        note: "Writer on habit formation; author of Atomic Habits.",                            era: "21st century" },
  { id: "newport",    name: "Cal Newport",           years: "b. 1982",        note: "Computer scientist and writer on attention, craft and digital minimalism.",       era: "21st century" },
  { id: "taleb",      name: "Nassim Nicholas Taleb", years: "b. 1960",        note: "Former trader and essayist; uncertainty, risk and antifragility.",                era: "21st century" },
  { id: "grant",      name: "Adam Grant",            years: "b. 1981",        note: "Organisational psychologist at Wharton; rethinking and generosity at work.",      era: "21st century" },
  { id: "burkeman",   name: "Oliver Burkeman",       years: "b. 1975",        note: "British journalist; finitude and the limits of productivity.",                    era: "21st century" },
  { id: "stevenson",  name: "Bryan Stevenson",       years: "b. 1959",        note: "Lawyer; founder of the Equal Justice Initiative, author of Just Mercy.",          era: "21st century" },
  { id: "wilkerson",  name: "Isabel Wilkerson",      years: "b. 1961",        note: "Journalist and historian; Pulitzer laureate, author of Caste.",                   era: "21st century" },
  { id: "coates",     name: "Ta-Nehisi Coates",      years: "b. 1975",        note: "Essayist and journalist; history, race and the craft of writing.",                era: "21st century", kente: true },
  { id: "adichie",    name: "Chimamanda Ngozi Adichie", years: "b. 1977",     note: "Nigerian novelist and essayist; narrative, voice and the single story.",          era: "21st century", kente: true },
  { id: "peterson",   name: "Jordan B. Peterson",    years: "b. 1962",        note: "Clinical psychologist; responsibility, meaning and order. See README on selection.", era: "21st century" },
  { id: "voss",       name: "Chris Voss",            years: "b. 1957",        note: "Former FBI lead international kidnapping negotiator; tactical empathy.",       era: "21st century" },
  { id: "klein",      name: "Naomi Klein",           years: "b. 1970",        note: "Canadian journalist and author; branding, crisis politics and climate.",        era: "21st century" }
];
