# RAG System Setup Checklist

Use this checklist to set up and verify your RAG system step by step.

## 📋 Pre-Setup Checklist

- [ ] Supabase account created
- [ ] Supabase project exists
- [ ] OpenAI API account with valid API key
- [ ] Python 3.8+ installed
- [ ] Git repository is up to date

## 🔧 Setup Steps

### Step 1: Environment Configuration

- [ ] Verify `.env` file contains:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `OPENAI_API_KEY`

### Step 2: Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

- [ ] All packages installed without errors
- [ ] No import warnings when running Python scripts

### Step 3: Database Setup

- [ ] Open Supabase Dashboard (https://app.supabase.com)
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `server/setup_supabase_schema.sql`
- [ ] Run SQL script
- [ ] Verify success message
- [ ] Check that `documents` table appears in Table Editor

### Step 4: Verify Setup

```bash
cd server
python test_rag_setup.py
```

- [ ] ✅ Dependencies PASS
- [ ] ✅ Supabase Connection PASS
- [ ] ✅ Documents Table PASS
- [ ] ✅ Vector Extension PASS
- [ ] ✅ OpenAI API PASS
- [ ] ✅ RAG_Docs Access PASS

### Step 5: Ingest Documents

```bash
python ingest_rag_documents.py
```

- [ ] Script starts without errors
- [ ] All 44 files processed
- [ ] ~500 chunks generated
- [ ] Upload to Supabase successful
- [ ] No error messages

### Step 6: Verify Ingestion

```bash
python manage_rag_db.py
```

Choose option 1: Count documents

- [ ] Total documents > 400
- [ ] Count matches expected number

Choose option 2: List categories

- [ ] "Core Training Knowledge" appears
- [ ] "SG Context" appears
- [ ] Subcategories listed correctly

Choose option 3: Sample documents

- [ ] Sample documents display correctly
- [ ] Metadata looks correct
- [ ] Content previews make sense

### Step 7: Test Query System

```bash
python rag_query.py
```

- [ ] Test queries run successfully
- [ ] Relevant documents found
- [ ] Similarity scores reasonable (0.6-0.9)
- [ ] No errors

### Step 8: Test API Integration

```bash
# Terminal 1: Start server
cd server
uvicorn app.main:app --reload
```

- [ ] Server starts on port 8000
- [ ] No startup errors

```bash
# Terminal 2: Test endpoints
curl http://localhost:8000/api/rag/categories
```

- [ ] Categories returned correctly
- [ ] JSON response valid

```bash
curl -X POST http://localhost:8000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "injury prevention", "max_results": 3}'
```

- [ ] Documents returned
- [ ] Similarity scores present
- [ ] Metadata included

```bash
curl -X POST http://localhost:8000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How to prevent running injuries?"}'
```

- [ ] Answer generated
- [ ] Sources included
- [ ] Response makes sense

### Step 9: Review Documentation

- [ ] Read `QUICKSTART_RAG.md`
- [ ] Read `RAG_SETUP.md`
- [ ] Review `example_rag_integration.py`
- [ ] Understand API endpoints

### Step 10: Integration Planning

- [ ] Identify where to integrate RAG in your app
- [ ] Plan UI for displaying sources
- [ ] Consider caching strategy
- [ ] Think about error handling

## 🎯 Post-Setup Validation

### Functionality Tests

- [ ] Search works for training-related queries
- [ ] Search works for Singapore-specific queries
- [ ] Category filtering works
- [ ] LLM responses are coherent
- [ ] Sources are cited correctly

### Performance Tests

- [ ] Query response time < 3 seconds
- [ ] Ingestion completes in < 5 minutes
- [ ] No memory issues during ingestion
- [ ] API endpoints respond quickly

### Data Quality Tests

- [ ] Documents are properly chunked
- [ ] No corrupted characters in content
- [ ] Metadata is accurate
- [ ] All categories represented

## 🚀 Ready for Production?

Before deploying to production, ensure:

### Code Quality

- [ ] All scripts run without errors
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Environment variables secure

### Database

- [ ] Row Level Security (RLS) policies reviewed
- [ ] Indexes created and working
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### API

- [ ] Rate limiting considered
- [ ] CORS configured correctly
- [ ] Authentication/authorization reviewed
- [ ] API documentation updated

### Monitoring

- [ ] Cost tracking set up (OpenAI, Supabase)
- [ ] Usage analytics planned
- [ ] Error tracking configured
- [ ] Performance monitoring ready

## 🔄 Maintenance Checklist

### Regular Tasks

- [ ] Monitor OpenAI API usage and costs
- [ ] Monitor Supabase storage and requests
- [ ] Review query patterns and optimize
- [ ] Update documents as needed

### When Adding New Documents

- [ ] Add `.md` files to appropriate folders in `RAG_Docs/`
- [ ] Run `python ingest_rag_documents.py`
- [ ] Verify new documents appear
- [ ] Test queries against new content

### When Updating Existing Documents

- [ ] Use `manage_rag_db.py` to delete old versions
- [ ] Or clear entire database and re-ingest
- [ ] Run ingestion script
- [ ] Verify updates

### Troubleshooting Workflow

1. [ ] Check error logs
2. [ ] Run `test_rag_setup.py`
3. [ ] Verify environment variables
4. [ ] Check Supabase dashboard
5. [ ] Test OpenAI API separately
6. [ ] Review recent code changes

## 📝 Notes & Issues

Use this section to track any issues or notes during setup:

```
Date: ___________
Issue:
Solution:

---

Date: ___________
Issue:
Solution:

---
```

## ✅ Final Checks

Before considering setup complete:

- [ ] All checklist items above are checked
- [ ] Documentation reviewed and understood
- [ ] Test queries work as expected
- [ ] API integration successful
- [ ] Ready to integrate into main application

## 🎓 Learning Resources

Additional resources to understand the system better:

- [ ] Understand vector embeddings concept
- [ ] Learn about semantic search
- [ ] Review LangChain documentation
- [ ] Explore Supabase vector capabilities
- [ ] Study RAG pattern and best practices

## 🆘 Getting Help

If you encounter issues:

1. Review error messages carefully
2. Check the troubleshooting section in `RAG_SETUP.md`
3. Run `test_rag_setup.py` to identify the issue
4. Review Supabase logs in dashboard
5. Check OpenAI API status page
6. Review GitHub issues for similar problems

---

**Setup Date:** ****\_\_\_****
**Completed By:** ****\_\_\_****
**Status:** [ ] Complete [ ] In Progress [ ] Issues Found

**Notes:**

```



```
