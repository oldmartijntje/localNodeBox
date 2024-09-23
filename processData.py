import json

def process_log_line(line):
    if 'payload:' in line:
        _, payload = line.split('payload:', 1)
        try:
            # Parse the JSON to ensure it's valid
            json_data = json.loads(payload.strip())
            # If valid, return the parsed JSON data
            return json_data
        except json.JSONDecodeError:
            return None
    return None

def main():
    json_payloads = []
    
    # Read from myMQTT.log
    with open('myMQTT.log', 'r') as input_file:
        for line in input_file:
            json_payload = process_log_line(line)
            if json_payload:
                json_payloads.append(json_payload)

    # Write all extracted JSON payloads to MQTT-log.json
    with open('MQTT-log.json', 'w') as output_file:
        # Write the JSON array to the file with indentation
        json.dump(json_payloads, output_file, indent=2)

if __name__ == "__main__":
    main()