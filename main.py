import eel
import os
import json


file_path = 'data.json'


def init_config_file():
    if not os.path.exists(file_path):
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('')


eel.init('web')


def save_data(data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def read_json() -> list:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileExistsError, json.JSONDecodeError):
        return []

@eel.expose
def read_data():
    return read_json()

@eel.expose
def add_data(name: str, time: int):
    data = read_json()
    
    last_id = 0 if data == [] else data[-1]['id']

    new_item = {'id': last_id+1, 'name': name, 'time': time}
    
    data.append(new_item)

    save_data(data)

    return new_item


@eel.expose
def update_data(id: int, name: str, time: int):
    data = read_json()
    for item in data:
        if item['id'] == id:
            item['name'] = name
            item['time'] = time
    save_data(data)

@eel.expose
def delete_data(id: int):
    print(type(id))
    data = read_json()
    data = [item for item in data if item['id'] != id]
    print(data)
    save_data(data)

@eel.expose
def get_data_item(id):
    data = read_json()
    for item in data:
        if item['id'] == id:
            return item



if __name__ == '__main__':
    init_config_file()

    eel.start(
        'index.html',
        size=(600,400)
    )