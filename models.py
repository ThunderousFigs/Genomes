from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Table
from flask_sqlalchemy import SQLAlchemy
from psycopg2 import connect
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from server import app

#Initialize postgreSQL genome database
engine = create_engine('postgres://localhost/genome', convert_unicode=True)
session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db_session = scoped_session(session_factory)
Base = declarative_base()
Base.query = db_session.query_property()


try:
    #connect to database if it exissts
    connection = connect(dbname='genome', user=app.config.get('DATABASE_USERNAME'), host='localhost', password=app.config.get('DATABASE_PASSWORD'))
except:
    #create database if it does not already exist
    connection = connect(user=app.config.get('DATABASE_USERNAME'), host='localhost', password=app.config.get('DATABASE_PASSWORD'))
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = connection.cursor()
    cursor.execute("CREATE DATABASE genome")
    cursor.close()
    connection.close()


# Join table between users and relatives, see User model relatives property
user_relatives = Table('user_relatives',
    Base.metadata,
    Column('user_profile_id', String(255), ForeignKey('users.profile_id')),
    Column('relative_id', Integer, ForeignKey('relatives.id'))
    )
#User model Schema
class User(Base):
    __tablename__ = 'users'
    profile_id = Column(String(255), primary_key=True, unique=True)
    email = Column(String(255), unique=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    location = Column(String(255), nullable=True)
    picture_url_small = Column(String(255), nullable=True)
    picture_url_medium = Column(String(255), nullable=True)
    picture_url_large = Column(String(255), nullable=True)
    rs12913832 = Column(String(255), nullable=True)
    rs8177374 = Column(String(255), nullable=True)
    rs1799971 = Column(String(255), nullable=True)
    rs806380 = Column(String(255), nullable=True)
    rs1800955 = Column(String(255), nullable=True)
    rs53576 = Column(String(255), nullable=True)
    rs1815739 = Column(String(255), nullable=True)
    rs6152 = Column(String(255), nullable=True)
    rs1800497 = Column(String(255), nullable=True)
    rs9939609 = Column(String(255), nullable=True)
    rs662799 = Column(String(255), nullable=True)
    rs17822931 = Column(String(255), nullable=True)
    rs4680 = Column(String(255), nullable=True)
    rs4988235 = Column(String(255), nullable=True)
    rs6025 = Column(String(255), nullable=True)
    rs7574865 = Column(String(255), nullable=True)
    rs1695 = Column(String(255), nullable=True)
    rs72921001 = Column(String(255), nullable=True)
    rs1537415 = Column(String(255), nullable=True)
    rs2472297 = Column(String(255), nullable=True)
    rs909525 = Column(String(255), nullable=True)

    # Setting up the relationship to the relatives table and user_relatives join table
    relatives = relationship('Relative', secondary=user_relatives, backref=backref('user', lazy='dynamic'))

    def __init__(self, profile_id, email, first_name, last_name, location, picture_url_small, picture_url_medium, picture_url_large, genotype_info):
        self.profile_id = profile_id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.location = location
        self.picture_url_small = picture_url_small
        self.picture_url_medium = picture_url_medium
        self.picture_url_large = picture_url_large
        self.rs12913832 = genotype_info['rs12913832']
        self.rs8177374 = genotype_info['rs8177374']
        self.rs1799971 = genotype_info['rs1799971']
        self.rs806380 = genotype_info['rs806380']
        self.rs1800955 = genotype_info['rs1800955']
        self.rs53576 = genotype_info['rs53576']
        self.rs1815739 = genotype_info['rs1815739']
        self.rs6152 = genotype_info['rs6152']
        self.rs1800497 = genotype_info['rs1800497']
        self.rs9939609 = genotype_info['rs9939609']
        self.rs662799 = genotype_info['rs662799']
        self.rs17822931 = genotype_info['rs17822931']
        self.rs4680 = genotype_info['rs4680']
        self.rs4988235 = genotype_info['rs4988235']
        self.rs6025 = genotype_info['rs6025']
        self.rs7574865 = genotype_info['rs7574865']
        self.rs1695 = genotype_info['rs1695']
        self.rs72921001 = genotype_info['rs72921001']
        self.rs1537415 = genotype_info['rs1537415']
        self.rs2472297 = genotype_info['rs2472297']
        self.rs909525 = genotype_info['rs909525']

    def serialize(self):
        return {
            'profile_id': self.profile_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'location': self.location,
            'picture_url_small': self.picture_url_small,
            'picture_url_medium': self.picture_url_medium,
            'picture_url_large': self.picture_url_large,
            'rs12913832': self.rs12913832,
            'rs8177374': self.rs8177374,
            'rs1799971': self.rs1799971,
            'rs806380': self.rs806380,
            'rs1800955': self.rs1800955,
            'rs53576': self.rs53576,
            'rs1815739': self.rs1815739,
            'rs6152': self.rs6152,
            'rs1800497': self.rs1800497,
            'rs9939609': self.rs9939609,
            'rs662799': self.rs662799,
            'rs17822931': self.rs17822931,
            'rs4680': self.rs4680,
            'rs4988235': self.rs4988235,
            'rs6025': self.rs6025,
            'rs7574865': self.rs7574865,
            'rs1695': self.rs1695,
            'rs72921001': self.rs72921001,
            'rs1537415': self.rs1537415,
            'rs2472297': self.rs2472297,
            'rs909525': self.rs909525
        }


#Relative schema
class Relative(Base):
    __tablename__ = 'relatives'
    id = Column(Integer(), primary_key=True)
    email = Column(String(255), unique=True, nullable=True)
    first_name = Column(String(255), default='Anonymous')
    last_name = Column(String(255), default='')
    sex = Column(String(255))
    residence = Column(String(255), nullable=True)
    similarity = Column(Float())
    maternal_side = Column(Boolean())
    paternal_side = Column(Boolean())
    picture_url = Column(String(255), nullable=True)
    birth_year = Column(Integer, nullable=True)
    relationship = Column(String(255), nullable=True)
    birthplace = Column(String(255), nullable=True)
    ancestry = Column(String(255), nullable=True)

    # add userId to init
    def __init__(self, email, first_name, last_name, sex, residence, similarity, maternal_side, paternal_side, picture_url, birth_year, relationship, birthplace, ancestry):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.sex = sex
        self.residence = residence
        self.similarity = similarity
        self.maternal_side = maternal_side
        self.paternal_side = paternal_side
        self.picture_url = picture_url
        self.birth_year = birth_year
        self.relationship = relationship
        self.birthplace = birthplace
        self.ancestry = ancestry

    def serialize(self):
        return {
            'id' : self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'sex': self.sex,
            'residence': self.residence,
            'similarity': self.similarity,
            'maternal_side': self.maternal_side,
            'paternal_side': self.paternal_side,
            'picture_url': self.picture_url,
            'birth_year': self.birth_year,
            'relationship': self.relationship,
            'birthplace': self.birthplace,
            'ancestry': self.ancestry
        }


#Snp data schema
class Snp(Base):
    __tablename__ = 'snps'
    id = Column(Integer(), primary_key=True)
    rs_id = Column(String(255))
    dnaPair = Column(String(255))
    outcome = Column(String(255))

    def __init__(self, rs_id, dnaPair, outcome):
        self.rs_id = rs_id
        self.dnaPair = dnaPair
        self.outcome = outcome

    def serialize(self):
        return {
            'rs_id': self.rs_id,
            'dnaPair': self.dnaPair,
            'outcome': self.outcome
        }


Base.metadata.create_all(engine)
