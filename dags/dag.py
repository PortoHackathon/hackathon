from airflow import DAG
from airflow.operators.dummy import DummyOperator
import datetime

with DAG(
    dag_id='example_dag',
    start_date=datetime.datetime(2023, 1, 1),
    schedule_interval='@daily',
) as dag:

    start = DummyOperator(task_id='start')
    end = DummyOperator(task_id='end')

    start >> end