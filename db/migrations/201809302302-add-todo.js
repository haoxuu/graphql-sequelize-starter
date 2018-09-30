module.exports = {
  up (queryInterface, Sequelize) {
    const sql = `
      create type todo_status as enum ('UNDO', 'DONE');

      create table todo (
        id serial primary key,
        name varchar(255) not null check(char_length(name) > 0),
        status todo_status default 'UNDO',
        "createTime" timestamp with time zone default now(),
        "userId" int not null references users(id)
      );
    `
    return queryInterface.sequelize.query(sql)
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('todo')
  }
}
