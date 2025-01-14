'use client'
import type { LexicalEditor } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js'
import { $getNodeByKey, COMMAND_PRIORITY_EDITOR } from 'lexical'
import React, { useCallback, useEffect, useState } from 'react'

import { useLexicalListDrawer } from '../../../../utilities/fieldsDrawer/useLexicalListDrawer.js'
import { EnabledRelationshipsCondition } from '../../../relationship/client/utils/EnabledRelationshipsCondition.js'
import { $createUploadNode } from '../nodes/UploadNode.js'
import { INSERT_UPLOAD_COMMAND } from '../plugin/index.js'
import { INSERT_UPLOAD_WITH_DRAWER_COMMAND } from './commands.js'

const insertUpload = ({
  editor,
  relationTo,
  replaceNodeKey,
  value,
}: {
  editor: LexicalEditor
  relationTo: string
  replaceNodeKey: null | string
  value: number | string
}) => {
  if (!replaceNodeKey) {
    editor.dispatchCommand(INSERT_UPLOAD_COMMAND, {
      // @ts-expect-error - TODO: fix this
      fields: null,
      relationTo,
      value,
    })
  } else {
    editor.update(() => {
      const node = $getNodeByKey(replaceNodeKey)
      if (node) {
        node.replace(
          $createUploadNode({
            data: {
              // @ts-expect-error - TODO: fix this
              fields: null,
              relationTo,
              value,
            },
          }),
        )
      }
    })
  }
}

type Props = {
  enabledCollectionSlugs: string[]
}

const UploadDrawerComponent: React.FC<Props> = ({ enabledCollectionSlugs }) => {
  const [editor] = useLexicalComposerContext()

  const [replaceNodeKey, setReplaceNodeKey] = useState<null | string>(null)

  const { closeListDrawer, ListDrawer, openListDrawer } = useLexicalListDrawer({
    collectionSlugs: enabledCollectionSlugs,
    uploads: true,
  })

  useEffect(() => {
    return editor.registerCommand<{
      replace: { nodeKey: string } | false
    }>(
      INSERT_UPLOAD_WITH_DRAWER_COMMAND,
      (payload) => {
        setReplaceNodeKey(payload?.replace ? payload?.replace.nodeKey : null)
        openListDrawer()
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor, openListDrawer])

  const onSelect = useCallback(
    ({ collectionSlug, docID }) => {
      closeListDrawer()
      insertUpload({
        editor,
        relationTo: collectionSlug,
        replaceNodeKey,
        value: docID,
      })
    },
    [editor, closeListDrawer, replaceNodeKey],
  )

  return <ListDrawer onSelect={onSelect} />
}

export const UploadDrawer = (props: Props): React.ReactNode => {
  return (
    <EnabledRelationshipsCondition {...props} uploads>
      <UploadDrawerComponent {...props} />
    </EnabledRelationshipsCondition>
  )
}
