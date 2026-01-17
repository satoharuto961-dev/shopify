import csv
import re
import os

# Configuration
INPUT_FILE = 'raw_products.txt'
OUTPUT_FILE = 'shopify_products_import.csv'

def slugify(text):
    """Create a URL handle from the title."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_products(content):
    """Parse the raw text content into a list of product dictionaries."""
    products = []
    lines = content.split('\n')
    
    buffer = []
    
    # Pre-cleaning: Identify the delimiter line which seems to be "Read  Download  Share  Save"
    # We will buffer lines until we hit that line.
    
    delimiter_keyword = "Read  Download  Share  Save"
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines at the very start of a buffer
        if not buffer and not line:
            i += 1
            continue
            
        if delimiter_keyword in line:
            # We found the end of a product block. Process the buffer.
            # Expected structure of buffer:
            # Line 0: Title
            # Line 1: Author
            # Line 2..N-1: Description
            # Line N: Meta (pdf · English...)
            
            if len(buffer) >= 3:
                # Extract Meta (last line of buffer usually)
                meta_line = buffer[-1]
                tags = []
                
                # Check if the last line is indeed the meta line (contains middle dot or file extension)
                if '·' in meta_line or any(ext in meta_line.lower() for ext in ['pdf', 'epub', 'doc']):
                    buffer.pop() # Remove it from meaningful content
                    # Parse tags
                    # Example: "pdf · English · 2020 · 8.4 MB"
                    parts = meta_line.split('·')
                    for p in parts:
                        clean_tag = p.strip()
                        if clean_tag:
                            tags.append(clean_tag)
                            
                # Extract Description
                # Description is everything left after Title (0) and Author (1)
                # Sometimes Author might be missing or merged? Assuming strict format for now.
                
                title = buffer[0]
                author = "Unknown"
                description_lines = []
                
                if len(buffer) > 1:
                    author = buffer[1]
                    description_lines = buffer[2:]
                else:
                    description_lines = []
                    
                description = " ".join(description_lines)
                
                # Remove "Read more..." artifact
                description = description.replace("Read more…", "").strip()
                description = description.replace("Read more...", "").strip()
                
                # Create Product Dict
                product = {
                    'Handle': slugify(title),
                    'Title': title,
                    'Vendor': author,
                    'Body (HTML)': f"<p>{description}</p>",
                    'Type': 'Book',
                    'Tags': ", ".join(tags),
                    'Published': 'TRUE',
                    'Variant Inventory Policy': 'continue',
                    'Variant Price': '0.00',
                    'Variant Fulfillment Service': 'manual'
                }
                products.append(product)
            
            # Reset buffer
            buffer = []
            
        else:
            # Normalize whitespace? Keep as is?
            # User text has "Read more..." attached to the end of lines potentially.
            buffer.append(line)
            
        i += 1
        
    return products

def main():
    # Look for file in root or current dir
    target_input = os.path.join(os.getcwd(), INPUT_FILE)
    if not os.path.exists(target_input):
        print(f"Error: Could not find '{INPUT_FILE}' in {os.getcwd()}")
        print("Please save your product list text into this file.")
        return

    print(f"Reading from {target_input}...")
    with open(target_input, 'r', encoding='utf-8') as f:
        content = f.read()
        
    products = parse_products(content)
    
    if not products:
        print("No products found. Please check the file format.")
        return

    target_output = os.path.join(os.getcwd(), OUTPUT_FILE)
    print(f"Generating {target_output} with {len(products)} products...")
    
    with open(target_output, 'w', newline='', encoding='utf-8') as f:
        # Standard Shopify CSV Columns
        fieldnames = [
            'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 
            'Option1 Name', 'Option1 Value', 
            'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 
            'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price', 
            'Variant Requires Shipping', 'Variant Taxable', 'Image Src'
        ]
        
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for p in products:
            row = {
                'Handle': p['Handle'],
                'Title': p['Title'],
                'Body (HTML)': p['Body (HTML)'],
                'Vendor': p['Vendor'],
                'Type': p['Type'],
                'Tags': p['Tags'],
                'Published': 'TRUE',
                'Option1 Name': 'Title',
                'Option1 Value': 'Default Title',
                'Variant Grams': '0',
                'Variant Inventory Tracker': '',
                'Variant Inventory Qty': '0', # Infinite if policy is continue
                'Variant Inventory Policy': 'continue',
                'Variant Fulfillment Service': 'manual',
                'Variant Price': p['Variant Price'],
                'Variant Requires Shipping': 'FALSE',
                'Variant Taxable': 'FALSE',
                'Image Src': ''
            }
            writer.writerow(row)
            
    print("Done! Import 'shopify_products_import.csv' into your Shopify Admin.")

if __name__ == "__main__":
    main()
