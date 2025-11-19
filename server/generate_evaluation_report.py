"""
Generate human-readable evaluation reports from evaluation results.

This script creates:
1. Summary reports (text)
2. Comparison tables (markdown)
3. Visualizations (if matplotlib available)
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from evaluate_models import ModelEvaluation


def load_evaluation(file_path: str) -> Dict[str, Any]:
    """Load an evaluation from JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_text_report(comparison_file: str, output_file: Optional[str] = None) -> str:
    """Generate a human-readable markdown report from comparison results."""
    with open(comparison_file, 'r', encoding='utf-8') as f:
        comparison = json.load(f)
    
    report = []
    report.append("# Model Evaluation Report")
    report.append("")
    report.append(f"**Generated:** {comparison.get('timestamp', 'Unknown')}")
    report.append(f"**Models Compared:** {', '.join(comparison.get('models_compared', []))}")
    report.append("")
    
    # Summary section
    report.append("## Summary")
    report.append("")
    
    summary = comparison.get('summary', {})
    
    # Automatic metrics summary
    auto_metrics = summary.get('automatic_metrics', {})
    if auto_metrics:
        report.append("### Automatic Metrics")
        report.append("")
        for metric, data in auto_metrics.items():
            if isinstance(data, dict) and 'avg' in data:
                report.append(f"- **{metric.replace('_', ' ').title()}:**")
                report.append(f"  - Average: {data['avg']:.2f}")
                report.append(f"  - Best: {data['best']:.2f}")
                report.append(f"  - Worst: {data['worst']:.2f}")
                report.append("")
    
    # LLM judge scores summary
    llm_scores = summary.get('llm_judge_scores', {})
    if llm_scores:
        report.append("### LLM Judge Scores (1-10 scale)")
        report.append("")
        for metric, data in llm_scores.items():
            if isinstance(data, dict) and 'avg' in data:
                report.append(f"- **{metric.replace('_', ' ').title()}:**")
                report.append(f"  - Average: {data['avg']:.2f}")
                report.append(f"  - Best: {data['best']:.2f}")
                report.append(f"  - Worst: {data['worst']:.2f}")
                report.append("")
    
    # Detailed comparison
    report.append("## Detailed Comparison")
    report.append("")
    
    detailed = comparison.get('detailed_comparison', {})
    for model_name, model_data in detailed.items():
        report.append(f"### {model_name} ({model_data.get('model_type', 'unknown')})")
        report.append("")
        
        # Automatic metrics
        auto = model_data.get('automatic_metrics')
        if auto:
            report.append("#### Automatic Metrics")
            report.append("")
            report.append(f"- **Total weeks:** {auto.get('total_weeks', 'N/A')}")
            report.append(f"- **Total workouts:** {auto.get('total_workouts', 'N/A')}")
            report.append(f"- **Avg workouts/week:** {auto.get('avg_workouts_per_week', 0):.2f}")
            report.append(f"- **Max weekly increase:** {auto.get('max_weekly_increase_pct', 0):.1f}%")
            report.append(f"- **Safety violations:** {len(auto.get('safety_violations', []))}")
            if auto.get('safety_violations'):
                report.append("")
                report.append("  Safety violations:")
                for violation in auto['safety_violations'][:3]:  # Show first 3
                    report.append(f"  - {violation}")
            report.append("")
        
        # LLM judge scores
        llm = model_data.get('llm_judge_scores')
        if llm:
            report.append("#### LLM Judge Scores")
            report.append("")
            report.append(f"- **Overall Quality:** {llm.get('overall_quality', 0):.1f}/10")
            report.append(f"- **Safety:** {llm.get('safety_appropriateness', 0):.1f}/10")
            report.append(f"- **Adherence to Principles:** {llm.get('adherence_to_principles', 0):.1f}/10")
            report.append(f"- **Personalization:** {llm.get('personalization', 0):.1f}/10")
            report.append(f"- **Completeness:** {llm.get('completeness', 0):.1f}/10")
            report.append("")
            
            if llm.get('strengths'):
                report.append("**Strengths:**")
                report.append("")
                for strength in llm['strengths'][:3]:
                    report.append(f"- {strength}")
                report.append("")
            
            if llm.get('weaknesses'):
                report.append("**Weaknesses:**")
                report.append("")
                for weakness in llm['weaknesses'][:3]:
                    report.append(f"- {weakness}")
                report.append("")
    
    # Recommendations
    recommendations = comparison.get('recommendations', [])
    if recommendations:
        report.append("## Recommendations")
        report.append("")
        for rec in recommendations:
            report.append(f"- {rec}")
        report.append("")
    
    report_text = "\n".join(report)
    
    if output_file:
        # Ensure .md extension
        output_path = Path(output_file)
        if output_path.suffix != '.md':
            output_path = output_path.with_suffix('.md')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_text)
        print(f"✅ Detailed report saved to: {output_path}")
    else:
        print(report_text)
    
    return report_text


def generate_markdown_table(comparison_file: str, output_file: Optional[str] = None) -> str:
    """Generate a markdown table comparing models."""
    with open(comparison_file, 'r', encoding='utf-8') as f:
        comparison = json.load(f)
    
    markdown = []
    markdown.append("# Model Evaluation Comparison\n")
    markdown.append(f"*Generated: {comparison.get('timestamp', 'Unknown')}*\n")
    
    # Summary table
    markdown.append("## Summary Metrics\n")
    markdown.append("| Metric | Average | Best | Worst |")
    markdown.append("|--------|---------|------|-------|")
    
    summary = comparison.get('summary', {})
    llm_scores = summary.get('llm_judge_scores', {})
    for metric, data in llm_scores.items():
        if isinstance(data, dict) and 'avg' in data:
            markdown.append(f"| {metric.replace('_', ' ').title()} | {data['avg']:.2f} | {data['best']:.2f} | {data['worst']:.2f} |")
    
    # Detailed comparison table
    markdown.append("\n## Detailed Comparison\n")
    
    detailed = comparison.get('detailed_comparison', {})
    models = list(detailed.keys())
    
    if models:
        # LLM Judge Scores table
        markdown.append("### LLM Judge Scores (1-10 scale)\n")
        markdown.append("| Model | Overall | Safety | Principles | Personalization | Completeness |")
        markdown.append("|-------|---------|--------|------------|-----------------|--------------|")
        
        for model_name in models:
            model_data = detailed[model_name]
            llm = model_data.get('llm_judge_scores', {})
            if llm:
                markdown.append(
                    f"| {model_name} | "
                    f"{llm.get('overall_quality', 0):.1f} | "
                    f"{llm.get('safety_appropriateness', 0):.1f} | "
                    f"{llm.get('adherence_to_principles', 0):.1f} | "
                    f"{llm.get('personalization', 0):.1f} | "
                    f"{llm.get('completeness', 0):.1f} |"
                )
        
        # Automatic Metrics table
        markdown.append("\n### Automatic Metrics\n")
        markdown.append("| Model | Weeks | Workouts | Avg/Week | Max Increase % | Safety Violations |")
        markdown.append("|-------|-------|----------|----------|----------------|-------------------|")
        
        for model_name in models:
            model_data = detailed[model_name]
            auto = model_data.get('automatic_metrics', {})
            if auto:
                markdown.append(
                    f"| {model_name} | "
                    f"{auto.get('total_weeks', 0)} | "
                    f"{auto.get('total_workouts', 0)} | "
                    f"{auto.get('avg_workouts_per_week', 0):.1f} | "
                    f"{auto.get('max_weekly_increase_pct', 0):.1f}% | "
                    f"{len(auto.get('safety_violations', []))} |"
                )
    
    markdown_text = "\n".join(markdown)
    
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_text)
        print(f"✅ Markdown report saved to: {output_file}")
    else:
        print(markdown_text)
    
    return markdown_text


def main():
    """Main function to generate reports."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate evaluation reports")
    parser.add_argument('comparison_file', help='Path to comparison JSON file')
    parser.add_argument('--format', choices=['text', 'markdown', 'both'], default='both',
                       help='Output format')
    parser.add_argument('--output-dir', default='evaluation_results',
                       help='Directory to save reports')
    
    args = parser.parse_args()
    
    output_dir = Path(args.output_dir)
    output_dir.mkdir(exist_ok=True)
    
    # Resolve path properly (handles both relative and absolute paths, Windows/Unix)
    comparison_file = Path(args.comparison_file)
    
    # Normalize path separators (handle both / and \)
    comparison_file = Path(str(comparison_file).replace('\\', '/'))
    
    # Try multiple locations
    possible_paths = []
    
    # 1. As-is (absolute or relative to current dir)
    possible_paths.append(comparison_file)
    
    # 2. Relative to current working directory
    if not comparison_file.is_absolute():
        possible_paths.append(Path.cwd() / comparison_file)
    
    # 3. Relative to script directory
    script_dir = Path(__file__).parent
    possible_paths.append(script_dir / comparison_file)
    
    # 4. Try resolving (expands . and ..)
    try:
        possible_paths.append(comparison_file.resolve())
    except:
        pass
    
    # Find the first path that exists
    comparison_file = None
    for path in possible_paths:
        if path.exists():
            comparison_file = path
            break
    
    # If still not found, try glob pattern (useful for wildcards like *.json)
    if comparison_file is None and '*' in str(args.comparison_file):
        import glob
        # Try glob from current directory
        matches = list(Path.cwd().glob(str(args.comparison_file)))
        if not matches:
            # Try from script directory
            matches = list(script_dir.glob(str(args.comparison_file)))
        if matches:
            comparison_file = matches[0]  # Use first match
            print(f"📁 Found file using glob: {comparison_file}")
    
    if comparison_file is None:
        print(f"❌ Comparison file not found: {args.comparison_file}")
        print(f"   Searched in:")
        for path in possible_paths:
            print(f"     - {path}")
        print(f"   Current directory: {Path.cwd()}")
        print(f"   Script directory: {script_dir}")
        print(f"\n💡 Tip: Use absolute path or ensure you're in the correct directory")
        return
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    if args.format in ['text', 'both']:
        # Detailed report (now in markdown format)
        detailed_file = output_dir / f"report_detailed_{timestamp}.md"
        generate_text_report(str(comparison_file), str(detailed_file))
    
    if args.format in ['markdown', 'both']:
        # Summary tables (quick reference)
        summary_file = output_dir / f"report_summary_{timestamp}.md"
        generate_markdown_table(str(comparison_file), str(summary_file))


if __name__ == "__main__":
    main()

