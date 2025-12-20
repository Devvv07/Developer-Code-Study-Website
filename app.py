from os import name
from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from datetime import datetime
from collections import deque

app = Flask(__name__, template_folder='templates', static_folder='static')

# ==============================
# 🔧 MySQL Configuration
# ==============================
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'developer_db'

mysql = MySQL(app)

# ==============================
# 🌀 Feedback Queue (FIFO)
# ==============================
review_queue = deque(maxlen=50)

# ==============================
# 🏠 Home Page
# ==============================
@app.route('/')
def index():
    return render_template('index.html')

# ==============================
# 📄 Subpages List
# ==============================
pages = [
    # --- BCA ---
    'bcaquiz', 'bcanote', 'bcapaperset', 'bcainterview',

    # --- BSc ---
    'bscquiz', 'bscnote', 'bscpaperset', 'bscinterview',

    # --- BTech ---
    'btechquiz', 'btechnote', 'btechpaperset', 'btechinterview',

    # --- About ---
    'about'
]

# ==============================
# 🔗 Dynamic Route Generator
# ==============================
for page in pages:
    def make_view(p=page):
        return render_template(f"{p}.html")
    app.add_url_rule(f"/{page}", endpoint=f"view_{page}", view_func=make_view)

# ==============================
# 💬 Feedback Submission
# ==============================
@app.route('/submit', methods=['POST'])
def submit():
    name = request.form.get('name')
    email = request.form.get('email')
    feedback = request.form.get('feedback')
    star = request.form.get('star', 5)
    phone = request.form.get('phone', '')
    quiz_name = request.form.get('quiz_name', 'General')


    if not all([name, email, feedback]):
        return jsonify({'status': 'error', 'message': 'Missing required fields'})

    try:
        cur = mysql.connection.cursor()
        cur.execute("""INSERT INTO users (name, email, phone, quiz_name, star , feedback) VALUES (%s, %s, %s, %s, %s, %s)""",
                     (name, email, phone, quiz_name, star, feedback))

        mysql.connection.commit()
        new_id = cur.lastrowid
        cur.close()

        review_queue.append({
            'id': new_id,
            'name': name,
            'email': email,
            'star': int(star),
            'feedback': feedback,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# ==============================
# 📦 Get Queue
# ==============================
@app.route('/get-queue')
def get_queue():
    return jsonify(list(review_queue))

# ==============================
# ❌ Delete Review
# ==============================
@app.route('/delete-review', methods=['POST'])
def delete_review():
    data = request.get_json()
    review_id = data.get('id')

    if not review_id:
        return jsonify({'status': 'error', 'message': 'Missing review ID'})

    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM users WHERE id = %s", (review_id,))
        mysql.connection.commit()
        cur.close()

        global review_queue
        review_queue = deque([r for r in review_queue if r['id'] != review_id], maxlen=50)

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# ==============================
# ⚠️ 404 Error Page
# ==============================
@app.errorhandler(404)
def not_found(e):
    return render_template('common_no_feedback.html', content="<h1>404 - Page Not Found</h1>"), 404

# ==============================
# 🚀 Run Flask App
# ==============================
if __name__ == '__main__':
    app.run(debug=True)
