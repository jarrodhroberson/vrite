import { ContentGroupColumn, AddContentGroupColumn } from "./content-group-column";
import { ContentGroupsContextProvider } from "../../content-groups-context";
import clsx from "clsx";
import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { Sortable } from "#components/primitives";
import { createRef } from "#lib/utils";
import { ScrollShadow } from "#components/fragments";
import { hasPermission, App, useClient } from "#context";

interface DashboardKanbanViewProps {
  ancestor?: App.ContentGroup | null;
  contentGroupsLoading?: boolean;
  contentGroups: App.ContentGroup<string>[];
  setAncestor(ancestor: App.ContentGroup | null | undefined): void;
  setContentGroups(contentGroups: App.ContentGroup<string>[]): void;
}

const DashboardKanbanView: Component<DashboardKanbanViewProps> = (props) => {
  const client = useClient();
  const [scrollableContainerRef, setScrollableContainerRef] = createRef<HTMLElement | null>(null);
  const [snapEnabled, setSnapEnabled] = createSignal(true);

  createEffect(
    on(
      () => props.contentGroups,
      (_contentGroups, _previousContentGroups, previousAncestorId) => {
        if (previousAncestorId === props.ancestor?.id) return;

        scrollableContainerRef()!.scrollLeft = 0;

        return props.ancestor?.id;
      }
    )
  );

  return (
    <div class="relative overflow-hidden pt-5 pb-2.5">
      <ScrollShadow
        scrollableContainerRef={scrollableContainerRef}
        color="contrast"
        direction="horizontal"
        offset="1.25rem"
      />
      <ContentGroupsContextProvider ancestor={() => props.ancestor} setAncestor={props.setAncestor}>
        <Sortable
          each={[...props.contentGroups, null]}
          wrapper="div"
          options={{
            ghostClass: `:base: border-4 border-gray-200 opacity-50 dark:border-gray-700 children:invisible !p-0 !m-2 !mt-0 !h-unset rounded-2xl`,
            filter: ".locked",
            disabled: !hasPermission("manageDashboard"),
            fallbackOnBody: true,
            onMove(event) {
              return !event.related.classList.contains("locked");
            },
            onUpdate(event) {
              if (typeof event.oldIndex === "number" && typeof event.newIndex === "number") {
                const id = event.item.dataset.contentGroupId;

                if (id) {
                  client.contentGroups.reorder.mutate({
                    id,
                    index: event.newIndex
                  });
                }
              }
            },
            onStart() {
              setSnapEnabled(false);
            },
            onEnd() {
              setSnapEnabled(true);

              const children = [...(scrollableContainerRef()?.children || [])] as HTMLElement[];
              const newItems = children
                .map((v) => {
                  return props.contentGroups.find((contentGroup) => {
                    return contentGroup.id.toString() === (v.dataset.contentGroupId || "");
                  });
                })
                .filter((item) => item) as App.ContentGroup[];

              children.sort(
                (a, b) => parseInt(a.dataset.index || "") - parseInt(b.dataset.index || "")
              );
              scrollableContainerRef()?.replaceChildren(...children);
              props.setContentGroups(newItems);
            }
          }}
          ref={setScrollableContainerRef}
          wrapperProps={{
            class: clsx(
              "flex-1 h-full auto-rows-fr grid-flow-column grid-flow-col grid-template-rows grid auto-cols-[calc(100vw-2.5rem)] md:auto-cols-85 overflow-x-scroll scrollbar-sm-contrast md:mx-5",
              snapEnabled() && `snap-mandatory snap-x`
            )
          }}
        >
          {(contentGroup, index) => {
            if (contentGroup) {
              return (
                <ContentGroupColumn
                  contentGroup={contentGroup}
                  index={index()}
                  onDragStart={() => setSnapEnabled(false)}
                  onDragEnd={() => setSnapEnabled(true)}
                  remove={(id) => {
                    props.setContentGroups(
                      props.contentGroups.filter((contentGroup) => contentGroup.id !== id)
                    );
                  }}
                />
              );
            }

            return (
              <Show when={hasPermission("manageDashboard")}>
                <AddContentGroupColumn class="locked" />
              </Show>
            );
          }}
        </Sortable>
      </ContentGroupsContextProvider>
    </div>
  );
};

export { DashboardKanbanView };
