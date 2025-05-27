import bcrypt from 'bcryptjs';

bcrypt.genSalt(10, function (err, salt) {
  if (err) console.error(`Gen salt error: ${err}`);

  bcrypt.hash('test4dm1n', salt!, function (err, hash) {
    if (err) console.error(`Hash error: ${err}`);
    console.log(hash);
  });
});
