"""
Example: How to integrate RAG into training plan generation
"""

import os
from dotenv import load_dotenv
from openai import OpenAI
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from rag_query import RAGQueryEngine

load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_training_plan_with_rag(
    user_goal: str,
    current_fitness_level: str,
    available_days: int,
    location: str = "Singapore",
    constraints: str = None
):
    """
    Generate a training plan using RAG for context-aware recommendations.
    
    Args:
        user_goal: e.g., "Run a 10K in under 60 minutes"
        current_fitness_level: e.g., "Beginner", "Intermediate", "Advanced"
        available_days: Number of days per week for training
        location: Location for context-specific advice
        constraints: Any additional constraints (injuries, time limits, etc.)
    
    Returns:
        Generated training plan with citations
    """
    
    # Initialize RAG engine
    rag = RAGQueryEngine(similarity_threshold=0.6, max_results=5)
    
    # Build queries to gather relevant context
    queries = []
    
    # Get general training periodization knowledge
    queries.append({
        "query": f"training plan structure for {user_goal} {current_fitness_level}",
        "category": "Core Training Knowledge"
    })
    
    # Get intensity zone information
    queries.append({
        "query": "heart rate zones and pace for running training",
        "category": "Core Training Knowledge",
        "subcategory": "Intensity zones, HR pace"
    })
    
    # Get progression guidelines
    queries.append({
        "query": "weekly mileage progression and training load management",
        "category": "Core Training Knowledge",
        "subcategory": "Progression & load (10 % rule, ACWR)"
    })
    
    # Get location-specific advice if in Singapore
    if location.lower() == "singapore":
        queries.append({
            "query": "running training in heat and humidity",
            "category": "SG Context"
        })
        
        queries.append({
            "query": "running routes and locations",
            "category": "SG Context",
            "subcategory": "Running routes"
        })
    
    # Get injury prevention knowledge
    if constraints and "injury" in constraints.lower():
        queries.append({
            "query": "injury prevention and safe running practices",
            "category": "Core Training Knowledge",
            "subcategory": "Injury prevention, Form, Cadence"
        })
    
    # Gather all relevant context
    all_context = []
    sources_used = []
    
    for query_info in queries:
        results = rag.search_documents(**query_info)
        
        for result in results:
            context_text = result.get('content', '')
            metadata = result.get('metadata', {})
            similarity = result.get('similarity', 0)
            
            all_context.append(f"[{metadata.get('filename')}]: {context_text}")
            
            source_info = {
                "filename": metadata.get('filename'),
                "category": metadata.get('category'),
                "subcategory": metadata.get('subcategory'),
                "similarity": similarity
            }
            if source_info not in sources_used:
                sources_used.append(source_info)
    
    # Combine all context
    combined_context = "\n\n---\n\n".join(all_context)
    
    # Create system prompt
    system_prompt = """You are an expert running coach creating personalized training plans.
Use the provided training knowledge to create evidence-based recommendations.
Always cite which documents your recommendations come from.
Consider the user's location, fitness level, and constraints.
Create a structured, week-by-week training plan."""
    
    # Create user prompt
    user_prompt = f"""Create a detailed training plan based on the following:

USER PROFILE:
- Goal: {user_goal}
- Current Fitness Level: {current_fitness_level}
- Available Training Days: {available_days} days per week
- Location: {location}
{f'- Constraints: {constraints}' if constraints else ''}

TRAINING KNOWLEDGE CONTEXT:
{combined_context}

Please create:
1. A 12-week training plan with week-by-week structure
2. Specific workout types for each session (easy runs, tempo, intervals, long runs, etc.)
3. Recommended intensity zones and paces
4. Location-specific advice for {location}
5. Progression strategy that follows evidence-based guidelines
6. Recovery and injury prevention recommendations
7. Nutrition and hydration tips

Format the plan clearly with citations to the source documents."""
    
    # Generate plan with LLM
    print("Generating training plan with RAG-enhanced context...")
    
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    plan = response.choices[0].message.content
    
    # Add sources section
    sources_text = "\n\n## SOURCES CONSULTED:\n"
    for source in sources_used:
        sources_text += f"\n- {source['filename']}"
        sources_text += f" ({source['category']}"
        if source['subcategory']:
            sources_text += f" > {source['subcategory']}"
        sources_text += f") - Relevance: {source['similarity']:.1%}"
    
    plan += sources_text
    
    return plan


# Example usage
if __name__ == "__main__":
    print("=" * 80)
    print("RAG-Enhanced Training Plan Generation Example")
    print("=" * 80)
    
    plan = generate_training_plan_with_rag(
        user_goal="Complete a half marathon in under 2 hours",
        current_fitness_level="Intermediate",
        available_days=4,
        location="Singapore",
        constraints="Need to manage hot weather conditions"
    )
    
    print("\n" + plan)
