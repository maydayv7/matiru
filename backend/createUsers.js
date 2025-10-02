const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const users = [
  { id: "farmer1", username: "farmer1", password: "password", role: "Farmer" },
  {
    id: "distributor1",
    username: "dist1",
    password: "password",
    role: "Distributor",
  },
  { id: "retailer1", username: "ret1", password: "password", role: "Retailer" },
  {
    id: "inspector1",
    username: "insp1",
    password: "password",
    role: "Inspector",
  },
];

(async () => {
  const out = users.map((u) => ({
    id: u.id,
    username: u.username,
    passwordHash: bcrypt.hashSync(u.password, 10),
    role: u.role,
  }));
  const dest = path.join(__dirname, "users.json");
  fs.writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log("users.json written to", dest);
  console.log("Demo accounts: (username / password)");
  out.forEach((u) => console.log(`${u.username} / password (role: ${u.role})`));
})();
