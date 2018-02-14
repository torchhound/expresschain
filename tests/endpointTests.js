const test = require('tape');
const request = require('supertest');

const app = require('../index');

test('get /mine', assert => {
  request(app)
    .get('/mine')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return assert.fail(err);
      assert.same(JSON.parse(res.body).message, 'New Block Mined');
      assert.pass('Mined a block successfully, test passed!');
      assert.end();
    });
});

test('post /transactions/new', assert => {
  request(app)
    .post('/transactions/new')
    .expect(201)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      if (err) return assert.fail(err);
      assert.same(JSON.parse(res.body).message, 'Transaction will be added');
      assert.pass('Posted a Transaction successfully, test passed!');
      assert.end();
    });
});

test('get /chain', assert => {
  request(app)
    .get('/chain')
    .expect(200)
    .end((err, res) => {
      if (err) return assert.fail(err);
      assert.pass('Return the Blockchain and its length successfully, test passed!');
      assert.end();
    });
});