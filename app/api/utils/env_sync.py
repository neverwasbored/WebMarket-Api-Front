import os


def env_sync():
    current_directory = os.getcwd()

    # Путь к основному .env
    backend_env_path = os.path.join(current_directory, '.env')

    # Путь к .env для React
    frontend_env_path = os.path.join(current_directory, 'react-app', '.env')

    # Читаем переменные из основного .env
    backend_env = {}
    try:
        with open(backend_env_path, 'r') as file:
            for line in file:
                # Пропускаем пустые строки и комментарии
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    backend_env[key] = value
    except FileNotFoundError:
        print(f"Основной .env файл не найден: {backend_env_path}")
        return

    # Очистить файл .env для React перед записью новых данных
    try:
        with open(frontend_env_path, 'w') as file:
            # Очищаем файл, просто открыв его в режиме 'w'
            file.truncate(0)  # Очистить содержимое файла

            # Записываем переменные в .env для React
            for key, value in backend_env.items():
                if key.startswith('REACT_APP_'):
                    file.write(f"{key}={value}\n")
        print(f"Переменные успешно синхронизированы в {frontend_env_path}")
    except Exception as e:
        print(f"Ошибка при записи в {frontend_env_path}: {e}")
