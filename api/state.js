// Vercel Serverless Function for Shared Voting App State across instances

const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ffb7084f91247';

const initialDB = {
  votes: {},
  session: {
    status: 'voting', // 'voting' | 'counting' | 'ended'
    countdownEndAt: null
  }
};

if (!globalThis._voting_db) {
  globalThis._voting_db = initialDB;
}

async function fetchRemoteDB() {
  try {
    const res = await fetch(CLOUD_DB_URL);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        globalThis._voting_db = json.data;
        return json.data;
      }
    }
  } catch (err) {
    console.error('Remote DB fetch error:', err);
  }
  return globalThis._voting_db;
}

async function saveRemoteDB(dbData) {
  globalThis._voting_db = dbData;
  try {
    await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'vote_db', data: dbData })
    });
  } catch (err) {
    console.error('Remote DB save error:', err);
  }
}

function checkCountdownState(db) {
  if (db.session.status === 'counting' && db.session.countdownEndAt) {
    if (Date.now() >= db.session.countdownEndAt) {
      db.session.status = 'ended';
      db.session.countdownEndAt = null;
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let db = await fetchRemoteDB();
  checkCountdownState(db);

  if (req.method === 'GET') {
    return res.status(200).json({ ...db, localIP: 'vercel' });
  }

  if (req.method === 'POST') {
    const { action, payload } = req.body || {};

    if (action === 'vote_submit') {
      const { userKey, votedTeam } = payload || {};

      if (db.session.status !== 'voting') {
        return res.status(400).json({ message: '투표가 마감되어 조를 변경할 수 없습니다.' });
      }

      if (!userKey || !votedTeam) {
        return res.status(400).json({ message: '잘못된 투표 요청입니다.' });
      }

      const assignedTeam = parseInt(userKey.split('_')[0], 10);
      if (assignedTeam === parseInt(votedTeam, 10)) {
        return res.status(400).json({ message: '자신이 속한 조에는 투표할 수 없습니다.' });
      }

      db.votes[userKey] = {
        votedTeam: parseInt(votedTeam, 10),
        updatedAt: Date.now()
      };

      if (Object.keys(db.votes).length >= 44 && db.session.status === 'voting') {
        db.session.status = 'counting';
        db.session.countdownEndAt = Date.now() + 10000;
      }

      await saveRemoteDB(db);
      return res.status(200).json({ success: true, ...db });
    }

    if (action === 'admin_reset') {
      db.votes = {};
      db.session.status = 'voting';
      db.session.countdownEndAt = null;
      await saveRemoteDB(db);
      return res.status(200).json({ success: true, ...db });
    }

    if (action === 'admin_force_countdown') {
      if (db.session.status === 'voting') {
        db.session.status = 'counting';
        db.session.countdownEndAt = Date.now() + 10000;
      }
      await saveRemoteDB(db);
      return res.status(200).json({ success: true, ...db });
    }

    if (action === 'admin_force_end') {
      db.session.status = 'ended';
      db.session.countdownEndAt = null;
      await saveRemoteDB(db);
      return res.status(200).json({ success: true, ...db });
    }

    return res.status(400).json({ message: '알 수 없는 요청입니다.' });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
