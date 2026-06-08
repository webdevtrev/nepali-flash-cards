import {CogIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Hide specific document types from the main Studio list (Pages, Lessons, People, Settings)
const DISABLED_TYPES = ['settings', 'assist.instruction.context', 'person']

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      ...S.documentTypeListItems()
        // Remove the "assist.instruction.context" and "settings" content  from the list of content types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          const title = pluralize(listItem.getTitle() as string)
          const item = listItem.title(title)

          return item.child(
            S.documentTypeList(listItem.getId() as string)
              .title(listItem.getTitle() as string)
              .showIcons(false),
          )
        }),
      // (Site Settings and other types intentionally hidden)
    ])
