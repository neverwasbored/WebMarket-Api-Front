import uvicorn

if __name__ == '__main__':
    uvicorn.run(app='app.main:app', host="192.168.0.105",
                port=8080, reload=False)
