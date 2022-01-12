/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(21)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(24)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'fk_likes.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_likes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');

  /*
    Menambahkan constraint UNIQUE, kombinasi comment_id dan owner.
    Guna menghindari duplikasi data antara nilai keduanya
  */
  pgm.addConstraint('likes', 'unique_comment_id_and_owner', 'UNIQUE (comment_id, owner)');
};

exports.down = (pgm) => {
  pgm.dropConstraint('likes', 'unique_comment_id_and_owner');
  pgm.dropConstraint('likes', 'fk_likes.owner_users.id');
  pgm.dropConstraint('likes', 'fk_likes.comment_id_comments.id');

  pgm.dropTable('likes');
};
