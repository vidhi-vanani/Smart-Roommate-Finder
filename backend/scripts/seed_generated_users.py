import argparse
import csv
import random
import shutil
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
CSV_PATH = Path("/Users/vidhivanani/Downloads/Samle data generation/users_output.csv")
UPLOADS_DIR = BACKEND_DIR / "static" / "uploads"
TARGET_USER_COUNT = 500

sys.path.insert(0, str(BACKEND_DIR))

from db.database import Base, SessionLocal, engine
from db.schema_sync import sync_message_columns, sync_user_preference_columns
from model.matches import Match
from model.message import Message
from model.request import RoommateRequest
from model.user import User
from services.security import hash_password

random.seed(687)


def parse_bool(value):
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def parse_int(value):
    if value is None or str(value).strip() == "":
        return None
    return int(float(value))


def parse_gender(value):
    normalized_value = str(value or "").strip().lower()

    if normalized_value == "male":
        return "Male"

    if normalized_value == "female":
        return "Female"

    return None


def parse_allergies(value):
    clean_value = str(value or "").strip()
    if clean_value.startswith("{") and clean_value.endswith("}"):
        clean_value = clean_value[1:-1]
    if not clean_value:
        return []
    return [item.strip() for item in clean_value.split(",") if item.strip()]


def load_csv_rows():
    with CSV_PATH.open("r", newline="", encoding="utf-8") as csv_file:
        return list(csv.DictReader(csv_file))[:TARGET_USER_COUNT]


def build_full_name(row, row_number):
    full_name = f"{row.get('first_name', '').strip()} {row.get('last_name', '').strip()}".strip()
    return full_name or f"User {row_number}"


def copy_profile_photo(source_photo_path, row_number):
    if not source_photo_path:
        return None

    source_path = Path(source_photo_path)
    if not source_path.exists() or not source_path.is_file():
        return None

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    extension = source_path.suffix or ".jpg"
    destination_filename = f"seed_user_{row_number}{extension}"
    destination_path = UPLOADS_DIR / destination_filename
    shutil.copy2(source_path, destination_path)

    return f"/static/uploads/{destination_filename}"


def delete_existing_data(db):
    db.query(Message).delete(synchronize_session=False)
    db.query(Match).delete(synchronize_session=False)
    db.query(RoommateRequest).delete(synchronize_session=False)
    db.query(User).delete(synchronize_session=False)
    db.commit()


def insert_users(db, rows):
    users = []
    used_usernames = set()

    for row_number, row in enumerate(rows, start=1):
        username = build_full_name(row, row_number)
        if username in used_usernames:
            username = f"{username} {row_number}"
        used_usernames.add(username)

        email = row.get("email") or f"user{row_number}@mail.com"
        password = row.get("password") or "password123"
        profile_photo = copy_profile_photo(row.get("image"), row_number)

        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
            phone_number=row.get("phone") or None,
            age=parse_int(row.get("age")),
            gender=parse_gender(row.get("gender")),
            diet=row.get("diet") or None,
            allergies=parse_allergies(row.get("allergies")),
            description=f"Hi, I am {row.get('first_name', '').strip()} and I am looking for a compatible roommate.".strip(),
            street_address=row.get("address") or None,
            city=row.get("city") or None,
            zip_code=parse_int(row.get("postal_code")),
            state=row.get("state_code") or None,
            country=row.get("country") or None,
            occupation=row.get("occupation") or None,
            min_budget=parse_int(row.get("min_budget")),
            max_budget=parse_int(row.get("max_budget")),
            quiet_hours_from=parse_int(row.get("quiet_hours_from")),
            quiet_hours_to=parse_int(row.get("quiet_hours_to")),
            cleanliness=row.get("cleanliness") or None,
            social_interaction=row.get("social_interaction") or None,
            interests=row.get("interests") or None,
            smoking_preference=parse_bool(row.get("smoking_preference")),
            profile_photo=profile_photo,
            is_active=True,
        )
        db.add(user)
        users.append(user)

    db.commit()

    for user in users:
        db.refresh(user)

    return users


def add_request(db, request_pairs, sender_id, receiver_id, status):
    if sender_id == receiver_id or (sender_id, receiver_id) in request_pairs:
        return False

    db.add(RoommateRequest(sender_id=sender_id, receiver_id=receiver_id, status=status))
    request_pairs.add((sender_id, receiver_id))
    return True


def add_unique_request(db, request_pairs, user_ids, sender_id, receiver_id, status):
    if add_request(db, request_pairs, sender_id, receiver_id, status):
        return True

    candidates = user_ids[:]
    random.shuffle(candidates)

    for candidate_id in candidates:
        if candidate_id != sender_id and add_request(db, request_pairs, sender_id, candidate_id, status):
            return True

    return False


def generate_matches_and_requests(db, users):
    user_ids = [user.id for user in users]
    request_pairs = set()
    match_pairs = set()

    for index, user_id in enumerate(user_ids):
        matched_user_ids = [
            user_ids[(index + 1) % len(user_ids)],
            user_ids[(index + 2) % len(user_ids)],
        ]

        for matched_user_id in matched_user_ids:
            db.add(Match(user_id=user_id, matched_user_id=matched_user_id))
            match_pairs.add((user_id, matched_user_id))
            add_unique_request(db, request_pairs, user_ids, user_id, matched_user_id, "accepted")

    for index, user_id in enumerate(user_ids):
        sent_targets = [
            user_ids[(index + 101) % len(user_ids)],
            user_ids[(index + 151) % len(user_ids)],
        ]
        incoming_senders = [user_ids[(index + 201) % len(user_ids)]]
        rejected_targets = [user_ids[(index + 301) % len(user_ids)]]

        if index % 2 == 0:
            incoming_senders.append(user_ids[(index + 251) % len(user_ids)])
            rejected_targets.append(user_ids[(index + 351) % len(user_ids)])

        for target_id in sent_targets:
            add_unique_request(db, request_pairs, user_ids, user_id, target_id, "pending")

        for sender_id in incoming_senders:
            add_unique_request(db, request_pairs, user_ids, sender_id, user_id, "pending")

        for target_id in rejected_targets:
            add_unique_request(db, request_pairs, user_ids, user_id, target_id, "rejected")

    db.commit()

    return {
        "matches": len(match_pairs),
        "requests": len(request_pairs),
        "accepted_requests": db.query(RoommateRequest).filter(RoommateRequest.status == "accepted").count(),
        "pending_requests": db.query(RoommateRequest).filter(RoommateRequest.status == "pending").count(),
        "rejected_requests": db.query(RoommateRequest).filter(RoommateRequest.status == "rejected").count(),
    }


def main():
    parser = argparse.ArgumentParser(description="Reset DB and seed generated users, matches, and roommate requests.")
    parser.add_argument("--confirm-delete", action="store_true", help="Required. Deletes users, matches, roommate_requests, and messages before seeding.")
    args = parser.parse_args()

    if not args.confirm_delete:
        raise SystemExit("Refusing to run without --confirm-delete because this script deletes existing database records.")

    rows = load_csv_rows()
    if len(rows) < TARGET_USER_COUNT:
        raise SystemExit(f"Expected at least {TARGET_USER_COUNT} CSV rows, found {len(rows)}.")

    Base.metadata.create_all(bind=engine)
    sync_user_preference_columns()
    sync_message_columns()

    db = SessionLocal()
    try:
        delete_existing_data(db)
        users = insert_users(db, rows)
        stats = generate_matches_and_requests(db, users)

        print(f"Inserted users: {len(users)}")
        print(f"Inserted directed matches: {stats['matches']}")
        print(f"Inserted roommate requests: {stats['requests']}")
        print(f"Accepted requests: {stats['accepted_requests']}")
        print(f"Pending requests: {stats['pending_requests']}")
        print(f"Rejected requests: {stats['rejected_requests']}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
