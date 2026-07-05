<script setup>
import * as octicons from "@primer/octicons";

const props = defineProps({
  name: {
    type: String,
    default: "dotFillIcon"
  },
  size: {
    type: Number,
    default: 16
  }
});

const iconSet = octicons.default || octicons["module.exports"] || {};
const iconAliases = {
  alertIcon: "alert",
  arrowRightIcon: "arrow-right",
  checkCircleIcon: "check-circle",
  checkIcon: "check",
  chevronRightIcon: "chevron-right",
  commentDiscussionIcon: "comment-discussion",
  databaseIcon: "database",
  diffIcon: "diff",
  dotFillIcon: "dot-fill",
  downloadIcon: "download",
  fileIcon: "file",
  filterIcon: "filter",
  gitBranchIcon: "git-branch",
  graphIcon: "graph",
  homeIcon: "home",
  issueOpenedIcon: "issue-opened",
  pencilIcon: "pencil",
  personAddIcon: "person-add",
  paperAirplaneIcon: "paper-airplane",
  playIcon: "play",
  projectRoadmapIcon: "project-roadmap",
  repoIcon: "repo",
  searchIcon: "search",
  signInIcon: "sign-in",
  signOutIcon: "sign-out",
  sparkleFillIcon: "sparkle-fill",
  syncIcon: "sync",
  targetIcon: "goal",
  telescopeIcon: "telescope",
  threeBarsIcon: "three-bars",
  toolsIcon: "tools",
  uploadIcon: "upload",
  xIcon: "x"
};

const iconName = iconAliases[props.name] || props.name;
const icon = iconSet[iconName] || iconSet["dot-fill"] || iconSet.alert;
</script>

<template>
  <span class="octicon-wrap" v-html="icon.toSVG({ width: size, height: size })"></span>
</template>
