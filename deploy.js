var node_ssh = require('node-ssh');
var ssh = new node_ssh();

ssh
  .connect({
    //host: '54.180.124.185',
    host: '127.0.0.1',
    username: 'ubuntu',
    privateKey: '/Users/jinear/workspace/REACT/barojaba/barojaba-aws-cto.pem',
  })
  .then(function () {
    // Command
    // Putting entire directories
    const failed = [];
    const successful = [];
    ssh
      .putDirectory('./', '/home/ubuntu/propic', {
        recursive: true,
        concurrency: 1,
        tick: function (localPath, remotePath, error) {
          if (error) {
            failed.push(localPath);
          } else {
            successful.push(localPath);
          }
        },
        validate: function (localPath) {
          if (
            /^public/.test(localPath) ||
            /^server/.test(localPath) ||
            /^src/.test(localPath)
          ) {
            return true;
          }
          return false;
        },
      })
      .then(function (status) {
        console.log(
          'the directory transfer was',
          status ? 'successful' : 'unsuccessful',
        );
        console.log('failed transfers', failed.join(', '));
        // console.log('successful transfers', successful.join(', '));
        // Command
        console.log('start build');
        ssh
          .execCommand('yarn build', {
            cwd: '/home/ubuntu/propic',
          })
          .then(function (result) {
            console.log('build was successful');
            ssh
              .execCommand('pm2 restart next', {
                cwd: '/home/ubuntu',
              })
              .then(function (result) {
                ssh.dispose();
              });
          });
      });
  });
