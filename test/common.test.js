let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;

// const env = process.env.NODE_ENV || 'development';
// if(env === 'test'){
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/news-test'
// } else {
//   process.env.MONGODB_URI = 'mongodb://localhost:27017/news'
// }
// mongoose.connect(process.env.MONGODB_URI);

chai.use(chaiHttp);
// describe('test', function () {
//     it('should  return status 200 for /sports', function (done) {
//         ;
//         chai
//             .request('localhost:4000')
//             .get('/sports')
//             .then(function (res) {
//                 expect(res).to.have.status(200);
//                 done();
//             })
//             .catch(function (err) {
//                 throw (err)
//             })
//     })
// });

describe('Testing  my Rest Api', () => {
    it('should  return status 200 for /', function (done) {
        chai.request('http://localhost:4000')
            .get('/')
            .then(function (res) {
                expect(res).to.have.status(200);
                done();
            })
            .catch(function (err) {
                throw (err)
            })
    });

    it('should return status 403 for /sports', function (done) {
        ;
        chai
            .request('http://localhost:4000')
            .get('/sports')
            .then(function (res) {
                expect(res).to.have.status(403);
                done();
            })
            .catch(function (err) {
                throw (err)
            })
    })
    it('should return the status 403 /about', function (done) {
        chai
            .request('http://localhost:4000')
            .get('/about')
            .then(function (res) {
                expect(res).to.have.status(403);
                done();
            })
            .catch(function (err) {
                throw (err);
            });
    });
    it('should return the status 403 for /contactus', function (done) {
        chai
            .request('http://localhost:4000')
            .get('/contactus')
            .then(function (res) {
                expect(res).to.have.status(403);
                done();
            })
            .catch(function (err) {
                throw (err);
            });
    });
    it('should return the status 404 for /login', function (done) {
        chai
            .request('http://localhost:4000')
            .get('/login')
            .then(function (res) {
                expect(res).to.have.status(404);
                done();
            })
            .catch(function (err) {
                throw (err);
            });
    });
    it('should return the status 403 for /editnews', function (done) {
        chai
            .request('http://localhost:4000')
            .get('/editnews')
            .then(function (res) {
                expect(res).to.have.status(403);
                done();
            })
            .catch(function (err) {
                throw (err);
            });
    });
    it('should return the status 403 for /addnews', function (done) {
        chai
            .request('http://localhost:4000')
            .get('/addnews')
            .then(function (res) {
                expect(res).to.have.status(403);
                done();
            })
            .catch(function (err) {
                throw (err);
            });
    });

})