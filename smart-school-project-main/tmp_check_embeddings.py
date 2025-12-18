import sqlite3, json
DB='d:/data_science_project/smart-school-project-main/smart_school_backend/database/smart_school.db'
conn=sqlite3.connect(DB)
conn.row_factory=sqlite3.Row
cur=conn.cursor()
try:
    cur.execute('SELECT id, person_id, role, name, class_name, section, subject, length(embedding) as eb FROM face_embeddings')
    rows=cur.fetchall()
    print('face_embeddings count=', len(rows))
    for r in rows:
        print(json.dumps(dict(r)))
except Exception as e:
    print('ERROR', e)
finally:
    conn.close()
