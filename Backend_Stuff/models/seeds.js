const seedUsers = [
  {
    email: "desmond.lim@generalassemb.ly",
    hash: "password12345",
    name: "Desmond Lim",
    isAdmin: true,
    friends: [],
  },
  {
    email: "czhenhao@hotmail.com",
    hash: "password12345",
    name: "Zhenhao Chen",
    friends: [],
  },
  {
    email: "ngnaaa@gmail.com",
    hash: "password12345",
    name: "Nyna Yusof",
    friends: [],
  },
  {
    email: "studentA@generalassemb.ly",
    hash: "password12345",
    name: "Student A",
    friends: [],
  },
  {
    email: "studentB@hotmail.com",
    hash: "password12345",
    name: "Student B",
    friends: [],
  },
  {
    email: "studentC@gmail.com",
    hash: "password12345",
    name: "Student C",
    friends: [],
  },
];

const seedBoards = [
  {
    title: "Starting Project Example 1",
    desc: "very first project in this app",
    members: [],
    activeCards: [],
    archiveCards: [],
  },
  //   {
  //     title: "Starting Project Example 2",
  //     desc: "second project in this app",
  //     members: [],
  //     activeCards: [],
  //     archiveCards: [],
  //   },
];

const seedCards = [
  {
    actionTitle: "1st Action",
    actionDesc: "To-Do Action",
    comments: [
      "This is were you plan your next step before attempting any tasks",
    ],
    status: "toDo",
  },
  {
    actionTitle: "2nd Action",
    actionDesc: "In-Progress Action",
    comments: ["This is were you start attempting the planned tasks"],
    status: "inProgress",
  },
  {
    actionTitle: "3rd Action",
    actionDesc: "Completed Action",
    comments: ["This is were you place the completed tasks"],
    status: "complete",
  },
];

module.exports = { seedUsers, seedBoards, seedCards };
