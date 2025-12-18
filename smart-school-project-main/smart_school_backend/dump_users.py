from utils.db import get_db

def main():
    db = get_db()
    cur = db.cursor()
    cur.execute('SELECT id,email,password,role FROM users')
    rows = cur.fetchall()
    for r in rows:
        pwd = r['password']
        print(r['id'], r['email'], (pwd[:60] + '...') if len(pwd) > 60 else pwd, r['role'])

if __name__ == '__main__':
    main()
