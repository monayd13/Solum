-- Run in Supabase SQL Editor after running 002_new_agents_schema.sql
-- Links each agent_template to its ElevenLabs agent ID

UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_0401kjm7e8p0fv69y263sgvcmc1n' WHERE name = 'Maya Thompson';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_6901kjm7eag1e2ctx53hnfn352x4' WHERE name = 'Daniel Mercer';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_0001kjm7ebvef2bvgy5y0q7tzewk' WHERE name = 'Claire Donovan';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_3801kjm7ed6mf42vttvh9n0tknd6' WHERE name = 'Tom Gallagher';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_4101kjm7eejzf7vbxyn4ym19q9nt' WHERE name = 'Harold Bennett';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_7801kjm7eg0xenx9jrqr5fcn9ft3' WHERE name = 'Mateo Rivera';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_3601kjm7ehdkfzfs1f387t4xqexq' WHERE name = 'Dr. Ana Morales';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_6601kjm7ejxmf558s936j1stz7ha' WHERE name = 'Rosa Gutierrez';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_1901kjm7em7cfxttek93v193yf9p' WHERE name = 'Priya Sharma';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_9001kjm7enkzfsyb06pav5d3bcj1' WHERE name = 'Kavita Devi';
UPDATE public.agent_templates SET elevenlabs_agent_id = 'agent_4601kjm7eq47f3wa35n29t4fnk28' WHERE name = 'Jimmy Carter';
