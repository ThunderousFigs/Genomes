import models
import demo
import snps

#Create a demo user in the db for users without a 23andMe account
def create_demo_user():
    #check to see if demo user already exists in the db
    if models.db_session.query(models.User).filter(models.User.profile_id=='demo_id').first() is None:
        #Create demo user and all demo user's associated relatives
        demo_user = models.User('demo_id', None, 'Lilly', 'Demo', None, None, None, None, demo.genome_data)
        for relative in demo.relatives:
            #Create a new relative with the information being passed from relatives_response
            new_relative = models.Relative(None, relative['first_name'], relative['last_name'], relative['sex'], relative['residence'], relative['similarity'], relative['maternal_side'], relative['paternal_side'], relative['picture_url'], relative['birth_year'], relative['relationship'], relative['birthplace'], relative['ancestry'])
            # Appending each relative to the demo user's relative property
            demo_user.relatives.append(new_relative)
            models.db_session.add(new_relative)
        # Add the demo user to the database and commit it
        models.db_session.add(demo_user)
        models.db_session.commit()


#CreateNewUser will be called in server.py when a user logging in has not been found in database
def createNewUser(name_response, relatives_response, genotype_response, user_response):
    #Grab the dnaPairs at relative snps
    genome_data = genotype_response.json().pop()
    #Define the user's basic information
    user_first_name = name_response.json()['first_name']
    user_last_name = name_response.json()['last_name']
    user_id = genome_data['id']
    user_email = user_response.json()
    #Create a new user following the Users Model
    new_user = models.User(user_id, user_email['email'], user_first_name, user_last_name, None, None, None, None, genome_data)
    #iterate through list of relatives
    for relative in relatives_response.json()['relatives']:
        #Create a new relative with the information being passed from relatives_response
        new_relative = models.Relative(None, relative['first_name'], relative['last_name'], relative['sex'], relative['residence'], relative['similarity'], relative['maternal_side'], relative['paternal_side'], None, relative['birth_year'], relative['relationship'], relative['birthplace'], relative['ancestry'])

        # Appending each relative to the user's relative property
        new_user.relatives.append(new_relative)
        models.db_session.add(new_relative)

    # Add the user to the database and commit it
    models.db_session.add(new_user)
    models.db_session.commit()


def createSnpsTable():
    if len(models.db_session.query(models.Snp).all()) == 0:

        for snp in snps.sample_snps:
            new_snp = models.Snp(snp['title'], snp['rs_id'], snp['dnaPair'], snp['outcome'], snp['video'])
            models.db_session.add(new_snp)
            models.db_session.commit()
