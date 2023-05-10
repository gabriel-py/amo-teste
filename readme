# About the exercises (little description of what was done):

Exercise 1: I understood it as an ETL and I thought that Pandas would be very helpful on the process of comparing the data we already had saved on database and the data coming daily from the external API because Pandas allows us to operate with the whole data as a single structure, like a matrix, making the code less repetitive and more efficient. The code for this exercise can be found on amo-backend/amo/tasks/import_airports.py.

Exercise 2: To display the data (the airports and its status) I used a Antd table component. There's also the required feature of filtering for active or inactive airport (the button to open a component to do that is located on the column itself) and deactivating a airport informing the reason why. Lastly, there is a airport's timeline where we can see the whole history of that airport, such as the times it was activated or deactivated, the reasons/explanations and even the user who did that. The backend code for this exercise can be found in amo-backend/amo/views/views.py and the frontend code in amo-frontend/src/pages/index.

Exercise 3: The required API was developed following the instructions and the data was treated using dicts, a native resource of Python, a very flexible one, which helped with all the manipulations that we need to do with the informations. The backend code for this exercise can be found on amo-backend/amo/views/mock_airlines.py.

# Backend (how to set it up and technologies)

The backend was developed using Django Rest Framework (https://www.django-rest-framework.org/), a Python framework. The Python version used was 3.10.6. Run the backend using the following command (starting from the initial directory):

1. make backend

To run the tests and the command of the exercise 1, follow these commands:

1. cd amo-backend/
2. python -m venv .venv
3. source .venv/bin/activate
4. pip install -r requirements.txt
5. python manage.py test / python manage.py import_airports

Technologies: Django, Django Rest Framework and Pandas, a library for data analysis/treatment (https://pandas.pydata.org/). The database I used was SQLite, since it's the simplest one and works very well on small projects.

# Frontend (how to set it up and technologies)

The frontend was developed using ReactJS (https://pt-br.legacy.reactjs.org/docs/getting-started.html), a JavaScript framework, UmiJS (a component states manager, similtar to Redux) and Antd (a UX/UI library, https://ant.design/docs/react/introduce). The Node version used was v14.17.0. Run the frontend using the following command (starting from the initial directory):

1. make frontend
or
1. npm install
2. npm start

Technologies: ReactJS, TypeScript, UmiJS and Ant Design.