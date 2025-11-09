"""
Utility script to manage the RAG documents database.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)


def count_documents():
    """Count total documents in the database."""
    try:
        response = supabase.table("documents").select("id", count="exact").execute()
        count = response.count if hasattr(response, 'count') else len(response.data)
        print(f"Total documents in database: {count}")
        return count
    except Exception as e:
        print(f"Error counting documents: {str(e)}")
        return 0


def get_categories():
    """Get unique categories and subcategories."""
    try:
        response = supabase.table("documents").select("metadata").execute()
        
        categories = {}
        for doc in response.data:
            metadata = doc.get("metadata", {})
            cat = metadata.get("category")
            subcat = metadata.get("subcategory")
            
            if cat:
                if cat not in categories:
                    categories[cat] = set()
                if subcat:
                    categories[cat].add(subcat)
        
        print("\nCategories in database:")
        for cat, subcats in categories.items():
            print(f"  {cat}:")
            for subcat in sorted(subcats):
                print(f"    - {subcat}")
        
        return categories
    except Exception as e:
        print(f"Error getting categories: {str(e)}")
        return {}


def clear_all_documents():
    """Clear all documents from the database."""
    confirm = input("\n⚠️  WARNING: This will delete ALL documents. Type 'DELETE ALL' to confirm: ")
    
    if confirm != "DELETE ALL":
        print("Cancelled.")
        return
    
    try:
        # Delete all documents
        response = supabase.table("documents").delete().neq("id", 0).execute()
        print(f"✓ All documents deleted.")
        count_documents()
    except Exception as e:
        print(f"Error deleting documents: {str(e)}")


def delete_by_category(category: str):
    """Delete documents by category."""
    confirm = input(f"\n⚠️  This will delete all documents in category '{category}'. Type 'DELETE' to confirm: ")
    
    if confirm != "DELETE":
        print("Cancelled.")
        return
    
    try:
        # Get all documents in category
        response = supabase.table("documents").select("id, metadata").execute()
        
        ids_to_delete = []
        for doc in response.data:
            metadata = doc.get("metadata", {})
            if metadata.get("category") == category:
                ids_to_delete.append(doc["id"])
        
        if ids_to_delete:
            # Delete in batches
            batch_size = 100
            for i in range(0, len(ids_to_delete), batch_size):
                batch = ids_to_delete[i:i + batch_size]
                supabase.table("documents").delete().in_("id", batch).execute()
            
            print(f"✓ Deleted {len(ids_to_delete)} documents from category '{category}'")
        else:
            print(f"No documents found in category '{category}'")
        
        count_documents()
    except Exception as e:
        print(f"Error deleting documents: {str(e)}")


def sample_documents(limit: int = 5):
    """Show sample documents from the database."""
    try:
        response = supabase.table("documents").select("id, content, metadata").limit(limit).execute()
        
        print(f"\nSample documents (showing {len(response.data)}):")
        for i, doc in enumerate(response.data, 1):
            metadata = doc.get("metadata", {})
            content_preview = doc.get("content", "")[:100] + "..."
            
            print(f"\n{i}. ID: {doc['id']}")
            print(f"   File: {metadata.get('filename', 'Unknown')}")
            print(f"   Category: {metadata.get('category', 'N/A')} > {metadata.get('subcategory', 'N/A')}")
            print(f"   Content: {content_preview}")
    except Exception as e:
        print(f"Error getting sample documents: {str(e)}")


def main():
    """Main menu for database management."""
    while True:
        print("\n" + "=" * 60)
        print("RAG Database Management")
        print("=" * 60)
        print("1. Count documents")
        print("2. List categories")
        print("3. Sample documents")
        print("4. Delete by category")
        print("5. Clear all documents")
        print("6. Exit")
        print("=" * 60)
        
        choice = input("\nEnter choice (1-6): ")
        
        if choice == "1":
            count_documents()
        elif choice == "2":
            get_categories()
        elif choice == "3":
            limit = input("How many samples to show? (default: 5): ")
            limit = int(limit) if limit.isdigit() else 5
            sample_documents(limit)
        elif choice == "4":
            get_categories()
            category = input("\nEnter category name to delete: ")
            delete_by_category(category)
        elif choice == "5":
            clear_all_documents()
        elif choice == "6":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
