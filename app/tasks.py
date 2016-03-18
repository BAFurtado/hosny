import logging
from city import City
from people import Person
from celery import Celery
from run import generate_population, load_population
from .handlers import SocketsHandler
from app import create_app


def make_celery(app):
    celery = Celery(app.import_name, broker=app.config['CELERY_BROKER_URL'], include=['app.tasks'])
    celery.conf.update(app.config)
    TaskBase = celery.Task
    class ContextTask(TaskBase):
        abstract = True
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)
    celery.Task = ContextTask
    return celery


app = create_app()
app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)
celery = make_celery(app)


# ehhh hacky
model = None
logger = logging.getLogger('simulation')


@celery.task
def setup_simulation(given):
    global model
    logger.setLevel(logging.INFO)
    sockets_handler = SocketsHandler()
    logger.addHandler(sockets_handler)

    # pop = generate_population(100)
    person = Person.generate(2005, given=given)
    print('YOU ARE', person)
    print('YOUR JOB IS', person.occupation)
    pop = load_population('data/population.json')
    pop.append(person) # TODO build out your social network
    model = City(pop)


@celery.task
def step_simulation():
    print('STEPPING SIMULATION')
    model.step()