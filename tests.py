from flask.ext.testing import TestCase
import unittest
# import controller

class MyTest(unittest.TestCase):
    
    def setUpClass(cls):
        import server
        import models
        import controller
        app = server.app
        app.config['TESTING'] = True
        return app
    # @classmethod
    # def setUpClass(self):
    #     pass
    #     # self.app = server.app

    def test_equal_numbers(self):
        print 'hi'
        server.makeDemoUser()
        self.assertEqual(2, 2)

    # def test_equal_numbers(self):
    #     self.assertEqual(2, 2)

    # @classmethod
    # def tearDownClass(cls):
    #     models.db_session.remove()


if __name__ == '__main__':
    unittest.main()

