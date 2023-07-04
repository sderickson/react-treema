import { TreemaRoot } from '../TreemaRoot';
import tv4 from 'tv4';
import { wrapTv4 } from '../utils';
import { TreemaMarkdownNodeDefinition } from '../definitions/markdown';

/**
 * This storybook tests complex CodeCombat scenarios. CodeCombat is what Treema was originally built for,
 * and these are real data/schema sets from the product to verify things work like the old Treema library.
 */
export default {
  title: 'IntegrationTests/CodeCombat',
  component: TreemaRoot,
  tags: ['autodocs'],
};

const schema = {
  'type': 'object',
  'additionalProperties': false,
  'properties': {
    'name': {
      'type': 'string',
      'maxLength': 100,
      'title': 'Name',
    },
    'slug': {
      'type': 'string',
      'maxLength': 100,
      'title': 'Slug',
      'format': 'hidden',
    },
    'description': {
      'title': 'Description',
      'description': 'A short explanation of what this scenario is about',
      'type': 'string',
      'maxLength': 2000,
      'format': 'markdown',
    },
    'persona': {
      'type': 'string',
      'title': 'Persona',
      'description': 'Which persona this scenario is for (kid, teacher, parent, etc.)',
    },
    'mode': {
      'type': 'string',
      'title': 'Mode',
      'description': 'Which mode this scenario is for (learn to use, practice using, etc.)',
      'enum': ['learn to use', 'practice using', 'use', 'teach how to use'],
    },
    'tool': {
      'type': 'string',
      'title': 'Tool',
      'description': 'Which generative AI tool this scenario is for (ChatGPT 4, ChatGPT 3.5, Stable Diffusion, DALL-E 2, etc.)',
    },
    'task': {
      'type': 'string',
      'title': 'Task',
      'description': 'Which task verb this scenario is for (make, edit, explain, etc.)',
    },
    'doc': {
      'type': 'string',
      'title': 'Doc',
      'description': 'Which document type this scenario is for (a webpage, an essay, an image, etc.))',
    },
    'releasePhase': {
      'type': 'string',
      'enum': ['beta', 'released'],
      'title': 'Release Phase',
      'description': 'Scenarios start off in beta, then are released when they are completed',
    },
    'interactions': {
      'title': 'Interactions',
      'type': 'object',
      'description': 'The choices, messages, prompts, teacher responses, and other interactions making up this scenario',
      'properties': {
        'start': {
          'type': 'array',
          'description': 'The main linear interactions triggered at the start of the scenario',
          'items': {
            '$ref': '#/definitions/inlineInteraction',
          },
        },
        'dynamic': {
          'type': 'array',
          'description': 'Any dynamic interactions triggered by events during the scenario',
          'items': {
            '$ref': '#/definitions/inlineInteraction',
          },
        },
      },
    },
    'i18n': {
      'additionalProperties': true,
      'type': 'object',
      'format': 'i18n',
      'props': ['name', 'description'],
    },
    '_id': {
      'type': ['object', 'string'],
      'links': [
        {
          'rel': 'self',
          'href': '/db/ai_scenario/{($)}',
        },
      ],
      'format': 'hidden',
    },
    '__v': {
      'title': 'Mongoose Version',
      'format': 'hidden',
    },
    'index': {
      'format': 'hidden',
    },
    '_algoliaObjectID': {
      'type': 'string',
      'format': 'hidden',
    },
    'version': {
      'default': {
        'minor': 0,
        'major': 0,
        'isLatestMajor': true,
        'isLatestMinor': true,
      },
      'format': 'version',
      'title': 'Version',
      'type': 'object',
      'readOnly': true,
      'additionalProperties': false,
      'properties': {
        'major': {
          'type': 'number',
          'minimum': 0,
        },
        'minor': {
          'type': 'number',
          'minimum': 0,
        },
        'isLatestMajor': {
          'type': 'boolean',
        },
        'isLatestMinor': {
          'type': 'boolean',
        },
      },
    },
    'original': {
      'type': ['object', 'string'],
      'links': [
        {
          'rel': 'extra',
          'href': '/db/ai_scenario/{($)}',
        },
      ],
      'format': 'hidden',
    },
    'parent': {
      'type': ['object', 'string'],
      'links': [
        {
          'rel': 'extra',
          'href': '/db/ai_scenario/{($)}',
        },
      ],
      'format': 'hidden',
    },
    'creator': {
      'type': ['object', 'string'],
      'links': [
        {
          'rel': 'extra',
          'href': '/db/user/{($)}',
        },
      ],
      'format': 'hidden',
    },
    'created': {
      'type': ['object', 'string'],
      'format': 'date-time',
      'title': 'Created',
      'readOnly': true,
    },
    'commitMessage': {
      'type': 'string',
      'maxLength': 500,
      'title': 'Commit Message',
      'readOnly': true,
    },
    'permissions': {
      'type': 'array',
      'items': {
        'type': 'object',
        'additionalProperties': false,
        'properties': {
          'target': {},
          'access': {
            'type': 'string',
            'enum': ['read', 'write', 'owner'],
          },
        },
      },
      'format': 'hidden',
    },
    'patches': {
      'type': 'array',
      'items': {
        '_id': {
          'type': ['object', 'string'],
          'links': [
            {
              'rel': 'db',
              'href': '/db/patch/{($)}',
            },
          ],
          'title': 'Patch ID',
          'description': 'A reference to the patch.',
        },
        'status': {
          'enum': ['pending', 'accepted', 'rejected', 'cancelled'],
        },
      },
      'title': 'Patches',
    },
    'allowPatches': {
      'type': 'boolean',
    },
    'watchers': {
      'type': 'array',
      'items': {
        'type': ['object', 'string'],
        'links': [
          {
            'rel': 'extra',
            'href': '/db/user/{($)}',
          },
        ],
      },
      'title': 'Watchers',
    },
    'i18nCoverage': {
      'title': 'i18n Coverage',
      'type': 'array',
      'items': {
        'type': 'string',
      },
    },
  },
  'title': 'AI Scenario',
  'description': 'A generative AI scenario',
  'required': ['releasePhase'],
  'default': {
    'releasePhase': 'beta',
    'interactions': {
      'start': [],
    },
  },
  'definitions': {
    'inlineInteraction': {
      'type': 'object',
      'additionalProperties': true,
      'properties': {
        'type': {
          'type': 'string',
          'enum': ['model-response', 'prompt-quiz', 'free-chat', 'chat-message', 'load-document'],
        },
        'actor': {
          'type': 'string',
          'enum': ['user', 'model', 'teacher', 'system'],
          'description': 'Who is performing this interaction',
        },
        'teacherDialogue': {
          '$ref': '#/definitions/teacherDialogue',
        },
        'repeat': {
          'oneOf': [
            {
              'type': 'boolean',
            },
            {
              'type': 'integer',
              'minimum': 1,
            },
          ],
        },
        'condition': {
          'type': 'object',
          'description': 'TODO',
        },
      },
      'description': 'An inline interaction',
      'definitions': {
        'teacherDialogue': {
          'type': ['object', 'string'], // modification
          'additionalProperties': false,
          'properties': {
            'text': {
              'type': 'string',
              'format': 'markdown',
            },
            'actions': {
              'type': 'array',
              'items': {
                'type': 'string',
                'maxLength': 100,
              },
            },
          },
          'required': ['text'],
        },
      },
      'required': ['type', 'actor'],
      'oneOf': [
        {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'type': {
              'type': 'string',
              'const': 'model-response',
              'pattern': '^model-response$', // modification
            },
            'actor': {
              'type': 'string',
              'const': 'model',
              'pattern': '^model$', // modification
            },
            'interaction': {
              'type': ['object', 'string'],
              'links': [
                {
                  'rel': 'db',
                  'href': '/db/ai_interaction/{($)}',
                },
              ],
            },
          },
          'title': 'Model Response',
          'required': [],
          'default': {
            'type': 'model-response',
            'actor': 'model',
          },
        },
        {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'type': {
              'type': 'string',
              'const': 'prompt-quiz',
              'pattern': '^prompt-quiz$', // modification
            },
            'actor': {
              'type': 'string',
              'const': 'user',
              'pattern': '^user$', // modification
            },
            'content': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'choices': {
                  'type': 'array',
                  'items': {
                    'type': 'object',
                    'additionalProperties': false,
                    'properties': {
                      'text': {
                        'type': 'string',
                      },
                      'isCorrect': {
                        'type': 'boolean',
                      },
                      'teacherDialogue': {
                        '$ref': '#/definitions/teacherDialogue',
                      },
                      'resultingInteraction': {
                        'type': ['object', 'string'],
                        'links': [
                          {
                            'rel': 'db',
                            'href': '/db/ai_interaction/{($)}',
                          },
                        ],
                      },
                    },
                    'required': ['text'],
                  },
                },
              },
              'required': ['choices'],
              'default': {
                'choices': [],
              },
            },
          },
          'title': 'Prompt Quiz',
          'required': ['content'],
          'default': {
            'type': 'prompt-quiz',
            'actor': 'user',
            'content': {},
          },
        },
        {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'type': {
              'type': 'string',
              'const': 'free-chat',
              'pattern': '^free-chat$', // modification
            },
            'actor': {
              'type': 'string',
              'const': 'user',
              'pattern': '^user$', // modification
            },
            'content': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'text': {
                  'type': 'string',
                  'format': 'markdown',
                },
              },
            },
          },
          'title': 'Free Chat',
          'default': {
            'type': 'free-chat',
            'actor': 'user',
            'content': {
              'text': '',
            },
          },
        },
        {
          'type': 'object',
          // "additionalProperties": false, // modification
          'properties': {
            'type': {
              'type': 'string',
              'const': 'chat-message',
              'pattern': '^chat-message$', // modification
            },
            'content': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'text': {
                  'type': 'string',
                  'format': 'markdown',
                },
              },
            },
          },
          'title': 'Chat Message',
          'default': {
            'type': 'chat-message',
            'actor': 'model',
            'content': {
              'text': '',
            },
          },
        },
        {
          'type': 'object',
          'additionalProperties': false,
          'properties': {
            'type': {
              'type': 'string',
              'const': 'load-document',
              'pattern': '^load-document$', // modification
            },
            'content': {
              'type': 'object',
              'additionalProperties': false,
              'properties': {
                'document': {
                  'type': ['object', 'string'],
                  'links': [
                    {
                      'rel': 'db',
                      'href': '/db/ai_document/{($)}',
                    },
                  ],
                },
              },
            },
          },
          'title': 'Load Document',
          'default': {
            'type': 'load-document',
            'actor': 'user',
            'content': {},
          },
        },
      ],
    },
  },
};

const data = {
  'version': {
    'major': 0,
    'minor': 0,
    'isLatestMajor': true,
    'isLatestMinor': true,
  },
  '_id': '645ea606f3e13cfb80028fd6',
  'permissions': [
    {
      'access': 'owner',
      'target': '512ef4805a67a8c507000001',
    },
  ],
  'created': '2023-05-12T20:48:06.504Z',
  'watchers': ['512ef4805a67a8c507000001'],
  'original': '645ea606f3e13cfb80028fd6',
  'creator': '512ef4805a67a8c507000001',
  'name': 'kid - learn to use - gpt4 - make - a browser game',
  'releasePhase': 'released',
  'interactions': {
    'start': [
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': "let's learn prompting for making games",
        },
      },
      {
        'content': {
          'choices': [
            {
              'text': 'Make a ',
              // "teacherDialogue": "be more specific: about what?"
            },
            {
              'text': 'Make a webpage about Minecraft',
              // "teacherDialogue": "pretty good, but for more complicated games let's use Phaserlet's specify "
            },
            {
              'text': 'Write the HTML5 game code for an Among Us typing game using Phaser. Respond only in code in a single HTML file.',
              'isCorrect': true,
              // "teacherDialogue": "good! let's see what it says"
            },
            {
              'text': 'Write an Among Us MMORPG',
              // "teacherDialogue": "huge games are too hard for an AI to do... for now"
            },
          ],
        },
        'type': 'prompt-quiz',
        'actor': 'user',
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': 'the AI wrote that! now check out your web game',
        },
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': "i see some bugs: broken image, it's too small, plus it's too fast and there's no score. let's fix!",
        },
      },
      {
        'actor': 'user',
        'type': 'prompt-quiz',
        'content': {
          'choices': [
            {
              'text': 'Add pictures',
              // "teacherDialogue": "be more specific: what bugs?"
            },
            {
              'text': 'Fix the image',
              // "teacherDialogue": "it doesn't know what you want for the image"
            },
            {
              'text': 'Add a hero image of Minecraft Steve fighting off a horde of endermen while a creeper explodes',
              'teacherDialogue': 'that would work, but we can fix more than one thing at a time',
            },
            {
              'text':
                'Make the game size responsive to fill the whole browser window, start the typing speed very slow and adjust the typing speed up and down based whether the player typed the word in time, show the current typing speed in accurate WPM, center the text and make it bigger, and use this image scaled to cover the page with full width or height: https://static.wikia.nocookie.net/among-us-wiki/images/f/f5/Among_Us_space_key_art_redesign.png',
              'teacherDialogue': 'ChatGPT is a text AI, not an image AI like DALL-E. this prompt will make the AI hallucinate image URLs.',
            },
          ],
        },
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': "nice. let's make it more fun by adding more words at a time",
        },
      },
      {
        'type': 'prompt-quiz',
        'actor': 'user',
        'content': {
          'choices': [
            {
              'text': 'Make multiple words at once, moving around the screen',
              'teacherDialogue': "let's add more detail and make multiple changes together",
            },
            {
              'text':
                "Let's have words for all the crewmate colors on the screen at a time. When one word is typed, respawn it in another location. Delete the letters typed in all matching words as they are typed, restoring the partial words' letters when a non-matching character is typed. Each word is worth 1 point per letter in the word when finished. Let's also have the words drift around randomly on the screen at a slow speed with flocking behavior.",
              'teacherDialogue': 'nice',
              'isCorrect': true,
            },
            {
              'text': 'Add a hero image of Minecraft Steve fighting off a horde of endermen while a creeper explodes',
              'teacherDialogue': 'this is too many things at once, it will confuse the AI',
            },
            {
              'text': 'Add an impostor that is worth double points',
              'teacherDialogue': "let's add multiple words before we add an impostor, so the impostor can interact with the other words",
            },
          ],
        },
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': 'now we can add the impostor!',
        },
      },
      {
        'type': 'prompt-quiz',
        'actor': 'user',
        'content': {
          'choices': [
            {
              'text': 'Make multiple words at once, moving around the screen',
              'teacherDialogue': "it will try to add a random imgur image! let's make one of the words an impostor instead.",
            },
            {
              'text':
                'Make one of the words into an impostor, changing its color to red and making it chase the other words instead of flocking with them. Impostors are worth double points. If an impostor catches a word, that word dies and respawns and costs you a point.',
              'teacherDialogue': 'nice',
              'isCorrect': true,
            },
            {
              'text': 'Add a hero image of Minecraft Steve fighting off a horde of endermen while a creeper explodes',
              'teacherDialogue': 'a good start, but being more specific will work better',
            },
            {
              'text':
                'Make the game size responsive to fill the whole browser window, start the typing speed very slow and adjust the typing speed up and down based whether the player typed the word in time, show the current typing speed in accurate WPM, center the text and make it bigger, and use this image scaled to cover the page with full width or height: https://static.wikia.nocookie.net/among-us-wiki/images/f/f5/Among_Us_space_key_art_redesign.png',
              'teacherDialogue':
                "multiple impostors may be a bit hard for the AI. plus, the game design will be more fun if it's more of an Among-Us-themed typing game than a typing-themed Among Us game",
            },
          ],
        },
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': "it's getting there! let's add a couple more things.",
        },
      },
      {
        'type': 'prompt-quiz',
        'actor': 'user',
        'content': {
          'choices': [
            {
              'text': "Let's add the accurate WPM counter back in. Let's also make the game resize when the window is resized.",
              'teacherDialogue': "it will try to add a random imgur image! let's make one of the words an impostor instead.",
              'isCorrect': true,
            },
            {
              'text': 'Add Among Us crewmate images and animations to the words',
              'teacherDialogue': 'nice',
            },
            {
              'text': 'Add an Among Us theme song background music track',
              'teacherDialogue': 'a good start, but being more specific will work better',
            },
            {
              'text': "Let's make it multiplayer so I can play with my friends",
              'teacherDialogue':
                "the AI can do this in a more complicated project, but you'll need to have a multi-file project setup with a server",
            },
          ],
        },
      },
      {
        'type': 'chat-message',
        'actor': 'teacher',
        'content': {
          'text': 'there you have it. now go ahead and add whatever else you like!',
        },
      },
      {
        'type': 'free-chat',
        'actor': 'user',
        'content': {
          'text': '',
        },
      },
    ],
  },
  'slug': 'kid-learn-to-use-gpt4-make-a-browser-game',
  'index': '512ef4805a67a8c507000001',
  '__v': 1,
  'description': "Let's learn how to prompt **ChatGPT 4** to make our own HTML5 browser game.",
  'mode': 'learn to use',
};

const tv4Instance = wrapTv4(tv4);
tv4Instance.addSchema(schema.definitions.inlineInteraction, '#/definitions/inlineInteraction');
tv4Instance.addSchema(schema.definitions.inlineInteraction.definitions.teacherDialogue, '#/definitions/teacherDialogue');

/**
 * This AI Scenario instance doesn't work *quite* right with the old Treema library. This story is to ensure the new one
 * does work quite right.
 */
export const AIScenario = {
  args: {
    schemaLib: tv4Instance,
    onEvent: (e: any) => console.log(e),
    data,
    schema,
    definitions: {
      'markdown': TreemaMarkdownNodeDefinition,      
    }
  },
};
