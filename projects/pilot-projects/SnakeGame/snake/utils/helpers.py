def resolve_conflict(local_data, remote_data):
    # Placeholder: prefer latest timestamp
    if local_data['timestamp'] > remote_data['timestamp']:
        return local_data
    else:
        return remote_data 